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
        //return {r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ]};
        return (data[position] * 256 + data[position + 1]) / 256 / 256;
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

        for (var x = 0; x < this.atlasIndexes.length; x++) {
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

        for (var x = 0; x < this.atlasIndexes.length; x++) {
            //this.atlasIndexes[x] = Math.round(Math.random() * 4);
            this.atlasIndexes[x] = Math.round(Math.random() * 3);
        }

        this.particles = new THREE.ParticleSystem( this._particleGeom,
            this.camelthornShaderMaterial
        );
        //this.particles.dynamic = false;

        mesh.add(this.particles);
        //ige.client.scene1._threeObj.add(this.particles);
    },

    //export Level
    buildRecast: function() {

        recast = new Recast('./recast/lib/recast');

        //export level with OBJExporter and save to path we can indicate to recast.js
        var objExporter = new THREE.OBJExporter();
        var obj = '';
        ige.server.scene1._threeObj.traverse(function( el ) {

            if ( el.geometry ) {
                obj += objExporter.parse( el.geometry );
            }

        });

        //console.log(obj);
        obj = 'mtllib nav_test.mtl\n        o nav_test.obj\n        v -21.847065 -2.492895 19.569759\n        v -15.847676 -2.492895 18.838863\n        v -21.847065 -0.895197 19.569759\n        v -15.847676 -0.895197 18.838863\n        v -21.585381 -2.492895 21.717730\n        v -15.585992 -2.492895 20.986834\n        v -21.585381 -0.895197 21.717730\n        v -15.585992 -0.895197 20.986834\n        v -22.078766 -1.169756 17.667891\n        v -16.079414 -1.169756 16.936998\n        v -22.078766 0.427928 17.667891\n        v -16.079414 0.427928 16.936998\n        v -21.817081 -1.169756 19.815861\n        v -15.817731 -1.169756 19.084969\n        v -21.817081 0.427928 19.815861\n        v -15.817731 0.427928 19.084969\n        v -22.310509 0.142680 15.765698\n        v -16.311157 0.142680 15.034807\n        v -22.310509 1.740365 15.765698\n        v -16.311157 1.740365 15.034807\n        v -22.048828 0.142680 17.913649\n        v -16.049477 0.142680 17.182758\n        v -22.048828 1.740365 17.913649\n        v -16.049477 1.740365 17.182758\n        v -22.541557 1.588395 13.869190\n        v -16.542206 1.588395 13.138299\n        v -22.541557 3.186100 13.869190\n        v -16.542206 3.186100 13.138299\n        v -22.279873 1.588395 16.017160\n        v -16.280521 1.588395 15.286268\n        v -22.279873 3.186100 16.017160\n        v -16.280521 3.186100 15.286268\n        v -22.775589 2.892463 11.948195\n        v -16.776237 2.892463 11.217304\n        v -22.775589 4.490149 11.948195\n        v -16.776237 4.490149 11.217304\n        v -22.513905 2.892463 14.096166\n        v -16.514553 2.892463 13.365274\n        v -22.513905 4.490149 14.096166\n        v -16.514553 4.490149 13.365274\n        v -23.008904 4.280072 10.033092\n        v -17.009552 4.280072 9.302201\n        v -23.008904 5.877757 10.033092\n        v -17.009552 5.877757 9.302201\n        v -22.747219 4.280072 12.181063\n        v -16.747868 4.280072 11.450171\n        v -22.747219 5.877757 12.181063\n        v -16.747868 5.877757 11.450171\n        v -23.234169 5.535265 8.184037\n        v -17.234818 5.535265 7.453146\n        v -23.234169 7.132950 8.184037\n        v -17.234818 7.132950 7.453146\n        v -22.972485 5.535265 10.332007\n        v -16.973133 5.535265 9.601116\n        v -22.972485 7.132950 10.332007\n        v -16.973133 7.132950 9.601116\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vn -0.642934 -0.577350 -0.503292\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503292\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503292 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503292\n        vn -0.503292 0.577350 0.642934\n        vn 0.642934 0.577350 0.503292\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vn -0.642934 -0.577350 -0.503291\n        vn 0.503291 -0.577350 -0.642934\n        vn -0.642934 0.577350 -0.503291\n        vn 0.503291 0.577350 -0.642934\n        vn -0.503291 -0.577350 0.642934\n        vn 0.642934 -0.577350 0.503291\n        vn -0.503291 0.577350 0.642934\n        vn 0.642934 0.577350 0.503291\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        vt 0.000000 0.000000\n        g Generic\n        usemtl Default\n        f 4/1/4 2/2/2 1/3/1 3/4/3\n        f 6/5/6 8/6/8 7/7/7 5/8/5\n        f 6/5/6 5/8/5 1/3/1 2/2/2\n        f 8/6/8 6/5/6 2/2/2 4/1/4\n        f 7/7/7 8/6/8 4/1/4 3/4/3\n        f 5/8/5 7/7/7 3/4/3 1/3/1\n        f 12/9/12 10/10/10 9/11/9 11/12/11\n        f 14/13/14 16/14/16 15/15/15 13/16/13\n        f 14/13/14 13/16/13 9/11/9 10/10/10\n        f 16/14/16 14/13/14 10/10/10 12/9/12\n        f 15/15/15 16/14/16 12/9/12 11/12/11\n        f 13/16/13 15/15/15 11/12/11 9/11/9\n        f 20/17/20 18/18/18 17/19/17 19/20/19\n        f 22/21/22 24/22/24 23/23/23 21/24/21\n        f 22/21/22 21/24/21 17/19/17 18/18/18\n        f 24/22/24 22/21/22 18/18/18 20/17/20\n        f 23/23/23 24/22/24 20/17/20 19/20/19\n        f 21/24/21 23/23/23 19/20/19 17/19/17\n        f 28/25/28 26/26/26 25/27/25 27/28/27\n        f 30/29/30 32/30/32 31/31/31 29/32/29\n        f 30/29/30 29/32/29 25/27/25 26/26/26\n        f 32/30/32 30/29/30 26/26/26 28/25/28\n        f 31/31/31 32/30/32 28/25/28 27/28/27\n        f 29/32/29 31/31/31 27/28/27 25/27/25\n        f 36/33/36 34/34/34 33/35/33 35/36/35\n        f 38/37/38 40/38/40 39/39/39 37/40/37\n        f 38/37/38 37/40/37 33/35/33 34/34/34\n        f 40/38/40 38/37/38 34/34/34 36/33/36\n        f 39/39/39 40/38/40 36/33/36 35/36/35\n        f 37/40/37 39/39/39 35/36/35 33/35/33\n        f 44/41/44 42/42/42 41/43/41 43/44/43\n        f 46/45/46 48/46/48 47/47/47 45/48/45\n        f 46/45/46 45/48/45 41/43/41 42/42/42\n        f 48/46/48 46/45/46 42/42/42 44/41/44\n        f 47/47/47 48/46/48 44/41/44 43/44/43\n        f 45/48/45 47/47/47 43/44/43 41/43/41\n        f 52/49/52 50/50/50 49/51/49 51/52/51\n        f 54/53/54 56/54/56 55/55/55 53/56/53\n        f 54/53/54 53/56/53 49/51/49 50/50/50\n        f 56/54/56 54/53/54 50/50/50 52/49/52\n        f 55/55/55 56/54/56 52/49/52 51/52/51\n        f 53/56/53 55/55/55 51/52/51 49/51/49;';
        recast.OBJDataLoader( obj, recast.cb(function(){

            console.log('data loaded');

            /**
             * Find a random navigable point on this mesh
             */
            recast.getRandomPoint(recast.cb(function(pt1x, pt1y, pt1z){

                recast.getRandomPoint(recast.cb(function(pt2x, pt2y, pt2z){

                    /**
                     * Find the shortest possible path from pt1 to pt2
                     */
                    recast.findPath(pt1x, pt1y, pt1z, pt2x, pt2y, pt2z, 1000, recast.cb(function(path){
                        if (path && typeof path.length !== 'undefined') {
                            console.log('found path has ' + path.length + ' segments', path);
                        }
                    }));

                }));

            }));


            recast.getNavMeshVertices(recast.cb(function (vertices) {

                this.navigationMesh = vertices;
				console.log('recast vertices:', vertices);

                // scene.add(navigationMesh);

                // renderer.render(scene, camera);
            }.bind(this)));
        }));
    },

    testRecast: function() {

        recast = new Recast('./recast/lib/recast');

        console.log('hello recast!', recast != undefined);
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = LevelUtils; }