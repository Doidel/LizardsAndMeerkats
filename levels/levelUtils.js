var levelUtils = {
   Grass: function(positions, mesh) {
       var textureAtlas = THREE.ImageUtils.loadTexture( './assets/textures/scenery/grassTextureAtlas.png', new THREE.UVMapping(), function() {
           arguments[0].flipY = false;
       }.bind(this));
       textureAtlas.minFilter = THREE.LinearMipMapLinearFilter;
       textureAtlas.magFilter = THREE.LinearFilter;

       // particle system material
       this.grassShaderMaterial = new THREE.ShaderMaterial( {
           uniforms:       {
               grassAtlas: { type: "t", value: textureAtlas },
               zoom: { type: 'f', value: 2.0 }
           },
           attributes:     {
               atlasIndex: { type: 'f', value: null }
           },
           vertexShader:   document.getElementById( 'grassvertexshader' ).textContent,
           fragmentShader: document.getElementById( 'grassfragmentshader' ).textContent,
           //blending: THREE.AdditiveBlending,
           depthTest: true,
           transparent: true
       });

       this._particleGeom = new THREE.BufferGeometry();
       this._particleGeom.dynamic = false;
       this._particleGeom.attributes = {

           position: {
               itemSize: 3,
               array: positions
           },

           atlasIndex: {
               itemSize: 1,
               array: new Float32Array( positions.length / 3 )
           }

       };
       this.positions = this._particleGeom.attributes.position.array;
       this.atlasIndexes = this._particleGeom.attributes.atlasIndex.array;

       for (var x = 0; x < this.positions.length; x++) {
           //this.atlasIndexes[x] = Math.round(Math.random() * 4);
           this.atlasIndexes[x] = Math.round(Math.random() * 3);
       }

       this.particles = new THREE.ParticleSystem( this._particleGeom,
           this.grassShaderMaterial
       );
       //this.particles.dynamic = false;

       mesh.add(this.particles);
       //ige.client.scene1._threeObj.add(this.particles);
   }
};