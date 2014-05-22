#define PHONG
varying vec3 vViewPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying float vHeight;
varying float vAngle;
#if defined( USE_MAP ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP )
uniform vec4 offsetRepeat;
#endif
#ifdef USE_LIGHTMAP
varying vec2 vUv2;
#endif
#if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
varying vec3 vReflect;
uniform float refractionRatio;
uniform bool useRefract;
#endif
#ifndef PHONG_PER_PIXEL
#if MAX_POINT_LIGHTS > 0
uniform vec3 pointLightPosition[ MAX_POINT_LIGHTS ];
uniform float pointLightDistance[ MAX_POINT_LIGHTS ];
varying vec4 vPointLight[ MAX_POINT_LIGHTS ];
#endif
#if MAX_SPOT_LIGHTS > 0
uniform vec3 spotLightPosition[ MAX_SPOT_LIGHTS ];
uniform float spotLightDistance[ MAX_SPOT_LIGHTS ];
varying vec4 vSpotLight[ MAX_SPOT_LIGHTS ];
#endif
#endif
#if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP )
varying vec3 vWorldPosition;
#endif
#ifdef USE_COLOR
varying vec3 vColor;
#endif
#ifdef USE_MORPHTARGETS
#ifndef USE_MORPHNORMALS
uniform float morphTargetInfluences[ 8 ];
#else
uniform float morphTargetInfluences[ 4 ];
#endif
#endif
#ifdef USE_SKINNING
#ifdef BONE_TEXTURE
uniform sampler2D boneTexture;
uniform int boneTextureWidth;
uniform int boneTextureHeight;
mat4 getBoneMatrix( const in float i ) {
float j = i * 4.0;
float x = mod( j, float( boneTextureWidth ) );
float y = floor( j / float( boneTextureWidth ) );
float dx = 1.0 / float( boneTextureWidth );
float dy = 1.0 / float( boneTextureHeight );
y = dy * ( y + 0.5 );
vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
mat4 bone = mat4( v1, v2, v3, v4 );
return bone;
}
#else
uniform mat4 boneGlobalMatrices[ MAX_BONES ];
mat4 getBoneMatrix( const in float i ) {
mat4 bone = boneGlobalMatrices[ int(i) ];
return bone;
}
#endif
#endif
#ifdef USE_SHADOWMAP
varying vec4 vShadowCoord[ MAX_SHADOWS ];
uniform mat4 shadowMatrix[ MAX_SHADOWS ];
#endif
void main() {
    vHeight =
    vUv = uv; //* offsetRepeat.zw + offsetRepeat.xy;
    #ifdef USE_LIGHTMAP
    vUv2 = uv2;
    #endif
    #ifdef USE_COLOR
    #ifdef GAMMA_INPUT
    vColor = color * color;
    #else
    vColor = color;
    #endif
    #endif
    #ifdef USE_MORPHNORMALS
    vec3 morphedNormal = vec3( 0.0 );
    morphedNormal +=  ( morphNormal0 - normal ) * morphTargetInfluences[ 0 ];
    morphedNormal +=  ( morphNormal1 - normal ) * morphTargetInfluences[ 1 ];
    morphedNormal +=  ( morphNormal2 - normal ) * morphTargetInfluences[ 2 ];
    morphedNormal +=  ( morphNormal3 - normal ) * morphTargetInfluences[ 3 ];
    morphedNormal += normal;
    #endif
    #ifdef USE_SKINNING
    mat4 boneMatX = getBoneMatrix( skinIndex.x );
    mat4 boneMatY = getBoneMatrix( skinIndex.y );
    #endif
    #ifdef USE_SKINNING
    mat4 skinMatrix = skinWeight.x * boneMatX;
    skinMatrix 	+= skinWeight.y * boneMatY;
    #ifdef USE_MORPHNORMALS
    vec4 skinnedNormal = skinMatrix * vec4( morphedNormal, 0.0 );
    #else
    vec4 skinnedNormal = skinMatrix * vec4( normal, 0.0 );
    #endif
    #endif
    vec3 objectNormal;
    #ifdef USE_SKINNING
    objectNormal = skinnedNormal.xyz;
    #endif
    #if !defined( USE_SKINNING ) && defined( USE_MORPHNORMALS )
    objectNormal = morphedNormal;
    #endif
    #if !defined( USE_SKINNING ) && ! defined( USE_MORPHNORMALS )
    objectNormal = normal;
    #endif
    #ifdef FLIP_SIDED
    objectNormal = -objectNormal;
    #endif
    vec3 transformedNormal = normalMatrix * objectNormal;
    vNormal = normalize( transformedNormal );
    vAngle = acos(dot( vNormal , vec3(0,1,0)));
    #ifdef USE_MORPHTARGETS
    vec3 morphed = vec3( 0.0 );
    morphed += ( morphTarget0 - position ) * morphTargetInfluences[ 0 ];
    morphed += ( morphTarget1 - position ) * morphTargetInfluences[ 1 ];
    morphed += ( morphTarget2 - position ) * morphTargetInfluences[ 2 ];
    morphed += ( morphTarget3 - position ) * morphTargetInfluences[ 3 ];
    #ifndef USE_MORPHNORMALS
    morphed += ( morphTarget4 - position ) * morphTargetInfluences[ 4 ];
    morphed += ( morphTarget5 - position ) * morphTargetInfluences[ 5 ];
    morphed += ( morphTarget6 - position ) * morphTargetInfluences[ 6 ];
    morphed += ( morphTarget7 - position ) * morphTargetInfluences[ 7 ];
    #endif
    morphed += position;
    #endif
    #ifdef USE_SKINNING
    #ifdef USE_MORPHTARGETS
    vec4 skinVertex = vec4( morphed, 1.0 );
    #else
    vec4 skinVertex = vec4( position, 1.0 );
    #endif
    vec4 skinned  = boneMatX * skinVertex * skinWeight.x;
    skinned 	  += boneMatY * skinVertex * skinWeight.y;
    #endif
    vec4 mvPosition;
    #ifdef USE_SKINNING
    mvPosition = modelViewMatrix * skinned;
    #endif
    #if !defined( USE_SKINNING ) && defined( USE_MORPHTARGETS )
    mvPosition = modelViewMatrix * vec4( morphed, 1.0 );
    #endif
    #if !defined( USE_SKINNING ) && ! defined( USE_MORPHTARGETS )
    mvPosition = modelViewMatrix * vec4( position, 1.0 );
    #endif
    gl_Position = projectionMatrix * mvPosition;
    vViewPosition = -mvPosition.xyz;
    #if defined( USE_ENVMAP ) || defined( PHONG ) || defined( LAMBERT ) || defined ( USE_SHADOWMAP )
    #ifdef USE_SKINNING
    vec4 worldPosition = modelMatrix * skinned;
    #endif
    #if defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
    vec4 worldPosition = modelMatrix * vec4( morphed, 1.0 );
    #endif
    #if ! defined( USE_MORPHTARGETS ) && ! defined( USE_SKINNING )
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    #endif
    #endif
    #if defined( USE_ENVMAP ) && ! defined( USE_BUMPMAP ) && ! defined( USE_NORMALMAP )
    vec3 worldNormal = mat3( modelMatrix[ 0 ].xyz, modelMatrix[ 1 ].xyz, modelMatrix[ 2 ].xyz ) * objectNormal;
    worldNormal = normalize( worldNormal );
    vec3 cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
    if ( useRefract ) {
    vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
    } else {
    vReflect = reflect( cameraToVertex, worldNormal );
    }
    #endif
    #ifndef PHONG_PER_PIXEL
    #if MAX_POINT_LIGHTS > 0
    for( int i = 0; i < MAX_POINT_LIGHTS; i ++ ) {
    vec4 lPosition = viewMatrix * vec4( pointLightPosition[ i ], 1.0 );
    vec3 lVector = lPosition.xyz - mvPosition.xyz;
    float lDistance = 1.0;
    if ( pointLightDistance[ i ] > 0.0 )
    lDistance = 1.0 - min( ( length( lVector ) / pointLightDistance[ i ] ), 1.0 );
    vPointLight[ i ] = vec4( lVector, lDistance );
    }
    #endif
    #if MAX_SPOT_LIGHTS > 0
    for( int i = 0; i < MAX_SPOT_LIGHTS; i ++ ) {
    vec4 lPosition = viewMatrix * vec4( spotLightPosition[ i ], 1.0 );
    vec3 lVector = lPosition.xyz - mvPosition.xyz;
    float lDistance = 1.0;
    if ( spotLightDistance[ i ] > 0.0 )
    lDistance = 1.0 - min( ( length( lVector ) / spotLightDistance[ i ] ), 1.0 );
    vSpotLight[ i ] = vec4( lVector, lDistance );
    }
    #endif
    #endif
    #if MAX_SPOT_LIGHTS > 0 || defined( USE_BUMPMAP )
    vWorldPosition = worldPosition.xyz;
    #endif
    #ifdef USE_SHADOWMAP
    for( int i = 0; i < MAX_SHADOWS; i ++ ) {
    vShadowCoord[ i ] = shadowMatrix[ i ] * worldPosition;
    }
    #endif

    vHeight = worldPosition.y;
}