THREE.ShaderLib['terrain'] = {

    uniforms: THREE.UniformsUtils.merge( [

        THREE.UniformsLib[ "common" ],
        THREE.UniformsLib[ "bump" ],
        THREE.UniformsLib[ "normalmap" ],
        THREE.UniformsLib[ "fog" ],
        THREE.UniformsLib[ "lights" ],
        THREE.UniformsLib[ "shadowmap" ],

        {
            "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
            "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
            "specular" : { type: "c", value: new THREE.Color( 0x111111 ) },
            "shininess": { type: "f", value: 30 },
            "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }
        }

    ] ),

        vertexShader: [

        "#define PHONG",

        "varying vec3 vViewPosition;",
        "varying vec3 vNormal;",
        "varying float vHeight;",
        "varying float vAngle;",

        THREE.ShaderChunk[ "map_pars_vertex" ],
        THREE.ShaderChunk[ "lightmap_pars_vertex" ],
        THREE.ShaderChunk[ "envmap_pars_vertex" ],
        THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
        THREE.ShaderChunk[ "color_pars_vertex" ],
        THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
        THREE.ShaderChunk[ "skinning_pars_vertex" ],
        THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

        "void main() {",

        THREE.ShaderChunk[ "map_vertex" ],
        THREE.ShaderChunk[ "lightmap_vertex" ],
        THREE.ShaderChunk[ "color_vertex" ],

        THREE.ShaderChunk[ "morphnormal_vertex" ],
        THREE.ShaderChunk[ "skinbase_vertex" ],
        THREE.ShaderChunk[ "skinnormal_vertex" ],
        THREE.ShaderChunk[ "defaultnormal_vertex" ],

        "vNormal = normalize( transformedNormal );",

        THREE.ShaderChunk[ "morphtarget_vertex" ],
        THREE.ShaderChunk[ "skinning_vertex" ],
        THREE.ShaderChunk[ "default_vertex" ],

        "vViewPosition = -mvPosition.xyz;",

        THREE.ShaderChunk[ "worldpos_vertex" ],
        THREE.ShaderChunk[ "envmap_vertex" ],
        THREE.ShaderChunk[ "lights_phong_vertex" ],
        THREE.ShaderChunk[ "shadowmap_vertex" ],

        "vHeight = worldPosition.y;",

        "}"

    ].join("\n"),

        fragmentShader: [

        "uniform sampler2D oceanTexture;",
        "uniform sampler2D sandyTexture;",
        "uniform sampler2D grassTexture;",
        "uniform sampler2D rockyTexture;",

        "uniform vec3 diffuse;",
        "uniform float opacity;",

        "uniform vec3 ambient;",
        "uniform vec3 emissive;",
        "uniform vec3 specular;",
        "uniform float shininess;",

        "varying float vHeight;",
        "varying float vAngle;",
        "const float PI_HALF = 3.141592653 / 2.0;",

        THREE.ShaderChunk[ "color_pars_fragment" ],
        THREE.ShaderChunk[ "map_pars_fragment" ],
        THREE.ShaderChunk[ "lightmap_pars_fragment" ],
        THREE.ShaderChunk[ "envmap_pars_fragment" ],
        THREE.ShaderChunk[ "fog_pars_fragment" ],
        THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
        THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
        THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
        THREE.ShaderChunk[ "normalmap_pars_fragment" ],
        THREE.ShaderChunk[ "specularmap_pars_fragment" ],

        "void main() {",

        "gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",


        //THREE.ShaderChunk[ "map_fragment" ],

        "#ifdef USE_MAP",

        "vec4 water = (smoothstep(0.01, 0.25, vHeight) - smoothstep(0.24, 0.26, vHeight)) * texture2D( oceanTexture, vUv * 10.0 );",
        "vec4 sandy = (smoothstep(0.24, 0.27, vHeight) - smoothstep(0.28, 0.31, vHeight)) * texture2D( sandyTexture, vUv * 10.0 );",
        "float a = (vAngle-PI_HALF) / PI_HALF;",
        "vec4 rocky = (smoothstep(0.28, 0.32, vHeight) * (1.0 - smoothstep(0.01, 0.89, a))) 				* texture2D( rockyTexture, vUv * 20.0 );",
        "vec4 grass = (smoothstep(0.28, 0.32, vHeight) * smoothstep(0.01, 0.9, a)) 			* texture2D( grassTexture, vUv * 20.0 );",
        "vec4 texelColor = vec4(0.0, 0.0, 0.0, 1.0) + water + sandy + grass + rocky;",

        "#ifdef GAMMA_INPUT",
        "texelColor.xyz *= texelColor.xyz;",
        "#endif",
        "gl_FragColor = gl_FragColor * texelColor;",
        "#endif",

        THREE.ShaderChunk[ "alphatest_fragment" ],
        THREE.ShaderChunk[ "specularmap_fragment" ],

        THREE.ShaderChunk[ "lights_phong_fragment" ],

        THREE.ShaderChunk[ "lightmap_fragment" ],
        THREE.ShaderChunk[ "color_fragment" ],
        THREE.ShaderChunk[ "envmap_fragment" ],
        THREE.ShaderChunk[ "shadowmap_fragment" ],

        THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

        THREE.ShaderChunk[ "fog_fragment" ],

        "}"

    ].join("\n")
};