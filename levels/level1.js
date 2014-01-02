// Create a plane
var Levels = {
    level1: function() {
        if (ige.isServer) {
            /*var groundShape = new CANNON.Plane();
            var groundBody = new CANNON.RigidBody(0,groundShape,ige.cannon._slipperyMaterial);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);

            ige.cannon._world.add(groundBody);*/

            var groundmat = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                0, // high friction
                .4 // low restitution
            );

            var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
            geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

           var ground = new Physijs.PlaneMesh(
                geometry,
                groundmat,
                0
            );
            ground.position.set(0,0,0);
            ige.server.scene1._threeObj.add(ground);
            /*
             var ground_material = Physijs.createMaterial(
             new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wood.jpg'), side: 2}),
             .8, // high friction
             .4 // low restitution
             );
             ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
             ground_material.map.repeat.set(2.5, 2.5);

             ground = new Physijs.HeightfieldMesh(
             geometry,
             new THREE.MeshLambertMaterial({color: '#ff0000'}),
             0
             );
             */
        } else {
            // FLOOR

            var grass = THREE.ImageUtils.loadTexture( './assets/textures/grass1.jpg' );
            grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
            grass.repeat.set( 32, 32 );

            /*var mapHeight = THREE.ImageUtils.loadTexture("./assets/textures/heightmap.png");
            //mapHeight.anisotropy = 8;

            var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib['phong'].uniforms);

            uniforms['map'].value = grass;
            uniforms['offsetRepeat'].value = new THREE.Vector4( 0, 0, 8, 8 ); //offsetx, offsety, repeatx, repeaty
            uniforms['u_height0'] = {type: "t", value: mapHeight};

            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: document.getElementById('vertexShaderHeight').textContent, //THREE.ShaderLib['phong'].vertexShader,
                fragmentShader: THREE.ShaderLib['phong'].fragmentShader,
                lights: true
            });

            material.map = true;*/

            var material = new THREE.MeshPhongMaterial({
                map: grass
            });

            // three floor
            var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
            geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

            var ambient = new THREE.AmbientLight( 0x999999 );
            ige.client.scene1._threeObj.add( ambient );


            var mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            mesh.position = new THREE.Vector3(0,0,0);
            ige.client.scene1._threeObj.add(mesh);

            //Plants
            new Plant1(new THREE.Vector3(10, 0.001, 5));
        }

        new Rock1(new THREE.Vector3(28, -3, 0), 3);
        new Rock1(new THREE.Vector3(22.2, -0.5, 1.2), 0.5);
        new Rock1(new THREE.Vector3(22.0, -0.25, -0.5), 0.25);

        new RockGold1(new THREE.Vector3(5.0, -2, -4.5), 2);
    },
    // Level 2 with height map
    level2: function(sunlight) {
        if (ige.isServer) {
            var hMapUrl = "./assets/heightmaps/hMapV3.png";
            // count of image borderlines - only used for lod
            var count = 1;

            var PNG = require('png-js');

            var pixels = [];
            PNG.decode(hMapUrl, function(pixels){
                var size = 64;
                var faces = 256;
                var shape = new THREE.PlaneGeometry(size, size, faces, faces);

                var vAmountX = faces+1;
                var vAmountY = faces+1;
                var multX = 1024 / vAmountX;
                var mult = (pixels.length / 4)/ ((vAmountX)*(vAmountY));
                var scale = 3;

                var count = 0;
                for (var i = 0; i < vAmountY; ++i) {
                    for (var j = 0; j < vAmountX; ++j) {
                        var pixelIndex = (parseInt(j*multX) + 1024 * parseInt(i*multX)) * 4;
                        //console.log(pixelIndex, pixels.length, pixels.length - pixelIndex);
                        //var color = Levels.getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
                        //var position = ( x + imagedata.width * y ) * 4;
                        shape.vertices[i*vAmountX + j].z = ((pixels[pixelIndex]/255 + pixels[pixelIndex + 1]/255 + pixels[pixelIndex + 2]/255)/3)*scale;
                    }
                }

                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var pMat = new THREE.MeshBasicMaterial();
                var pGround = new Physijs.HeightfieldMesh(
                    shape, pMat, 0
                );
                pGround.rotation.x = -Math.PI / 2;
                pGround.position.set(0,-50,0);
                ige.server.scene1._threeObj.add(pGround);
            });
        } else {
            // FLOOR

            var hMapUrl = "./assets/heightmaps/hMapV3.png";
            // count of image borderlines - only used for lod
            var count = 1;
            var hMap = new Image();
            Levels.loadImage(hMap, hMapUrl, count, function(){
                var imagedata = Levels.getImageData(hMap);

                var size = 64;
                var faces = 256;
                var shape = new THREE.PlaneGeometry(size, size, faces, faces);
                var floorTexture = new THREE.ImageUtils.loadTexture('./assets/textures/grass1.jpg');
                var cover = new THREE.MeshLambertMaterial({map: floorTexture, side: 2});

                var vAmountX = faces+1;
                var vAmountY = faces+1;
                var multX = hMap.width / vAmountX;
                var multY = hMap.height / vAmountY;
                var scale = 3;

                count = 0;
                for (var i = 0; i < vAmountY; ++i) {
                    for (var j = 0; j < vAmountX; ++j) {
                        var color = Levels.getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
                        shape.vertices[i*vAmountX + j].z = ((color.r/255 + color.g/255 + color.b/255)/3)*scale;
                        //ige.log(shape.vertices[i*vAmountX + j].z, count++, "client");
                    }
                }

                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var ground = new THREE.Mesh(shape, cover);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                ground.castShadow = true;
                ground.position.set(0,-50,0);
                ige.client.scene1._threeObj.add(ground);

                // water
                /*
                var parameters = {
                    width: 2000,
                    height: 2000,
                    widthSegments: 1,
                    heightSegments: 1,
                    depth: 1500,
                    param: 4,
                    filterparam: 1
                };

                // Load textures
                var waterNormals = new THREE.ImageUtils.loadTexture( './assets/textures/waternormals.jpg' );
                waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

                // Create the water effect
                console.log(ige);
                watershader = new THREE.Water( ige._threeRenderer, ige._currentCamera._threeObj, ige.client.scene1._threeObj, {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: waterNormals,
                    alpha: 	0.85,
                    sunDirection: sunlight.position.normalize(),
                    sunColor: 0xffffff,
                    waterColor: 0x001e0f,
                    distortionScale: 50.0
                } );

                var aMeshMirror = new THREE.Mesh(
                    new THREE.PlaneGeometry( parameters.width * 500, parameters.height * 500, 50, 50 ),
                    watershader.material
                );
                aMeshMirror.add( watershader );
                aMeshMirror.rotation.x = - Math.PI * 0.5;
                ige.client.scene1._threeObj.add(aMeshMirror);

                // update content
                ige.client.scene1._threeObj.addBehavior('updateContent', function(){
                    watershader.material.uniforms.time.value += 0.25 / 60.0;
                    watershader.render();
                });
                */
            });
        }
        new Rock1(new THREE.Vector3(28, -3, 0), 3);
        new Rock1(new THREE.Vector3(22.2, -0.5, 1.2), 0.5);
        new Rock1(new THREE.Vector3(22.0, -0.25, -0.5), 0.25);

        new RockGold1(new THREE.Vector3(5.0, -2, -4.5), 2);
    },
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
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Levels; }