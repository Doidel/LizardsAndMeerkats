var LevelUtils = {

    // load a shader file
    loadShader: function(url){
        var req = new XMLHttpRequest();
        req.open("GET", url, false);
        req.send(null);
        if (req.status == 200)
            return req.responseText;
        else
        {
            log("File open failed: " + url);
            return null;
        }
    },
    // get a pixel of an image
    getPixel: function(imagedata, x, y){
        var position = ( x + imagedata.width * y ) * 4;
        var data = imagedata.data;
        return {r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ]};
    },
    // get the canvas data of an image
    getImageData: function(image){
        var canvas = document.createElement( 'canvas' );
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext( '2d' );
        context.drawImage( image, 0, 0 );

        return context.getImageData( 0, 0, image.width, image.height );
    },
    // load the image and give a callback as soon as it's loaded
    loadImage: function(hMap, src, count, callback){
        hMap.src = src;
        hMap.onload = callback;
    },
    // load server side image for nodejs !! needs to be in png format!!
    /*getImageDataSever: function(url) {
     var png = require('png-js');

     var pixels = [];
     png.decode(url, function(pixels){
     console.log(pixels);
     });

     return pixels;
     }*/

    Grass: function(positions, mesh) {
        var textureAtlas = THREE.ImageUtils.loadTexture( './assets/textures/scenery/grassTextureAtlas.png', new THREE.UVMapping(), function() {
            arguments[0].flipY = false;
        }.bind(this));
        textureAtlas.minFilter = THREE.LinearMipMapLinearFilter;
        textureAtlas.magFilter = THREE.LinearFilter;

        // particle system material
        this.grassShaderMaterial = new THREE.ShaderMaterial( {
            uniforms:       {
                atlas: { type: "t", value: textureAtlas },
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

        //mesh.add(this.particles);
        ige.client.scene1._threeObj.add(this.particles);
    },

    Camelthorn: function(positions, mesh) {
        var textureAtlas = THREE.ImageUtils.loadTexture( './assets/textures/scenery/camelthornTextureAtlas.png', new THREE.UVMapping(), function() {
            arguments[0].flipY = false;
        }.bind(this));
        textureAtlas.minFilter = THREE.LinearMipMapLinearFilter;
        textureAtlas.magFilter = THREE.LinearFilter;

        // particle system material
        this.camelthornShaderMaterial = new THREE.ShaderMaterial( {
            uniforms:       {
                atlas: { type: "t", value: textureAtlas },
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
            this.camelthornShaderMaterial
        );
        //this.particles.dynamic = false;

        mesh.add(this.particles);
        //ige.client.scene1._threeObj.add(this.particles);
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = LevelUtils; }