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
                0 // low restitution
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
    level2: function() {
        if (ige.isServer) {
            var hMapUrl = "./assets/heightmaps/NullHeight.png";
            //var hMapUrl = "./assets/heightmaps/Botswana.png";
            //var hMapUrl = "./assets/heightmaps/hMapV3.png";
            // count of image borderlines - only used for lod
            var count = 1;

            var PNG = require('png-js');

            var pixels = [];
            PNG.decode(hMapUrl, function(pixels){
                var size = 1024;
                var faces = 128;
                var shape = new THREE.PlaneGeometry(size, size, faces, faces);

                var vAmountX = faces+1;
                var vAmountY = faces+1;
                var multX = 1024 / vAmountX;
                var mult = (pixels.length / 4)/ ((vAmountX)*(vAmountY));
                var scale = 50;


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
                shape.vertices[0].z = 51;

                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var groundmat = Physijs.createMaterial(
                    new THREE.MeshBasicMaterial(),
                    0, // high friction
                    0 // low restitution
                );
                var pGround = new Physijs.HeightfieldMesh(
                    shape, groundmat, 0
                );
                pGround.rotation.x = -Math.PI / 2;
                pGround.position.set(0,0,0);
                ige.server.scene1._threeObj.add(pGround);
                ige.server.scene1._terrain = pGround;
            });
        } else {
            // FLOOR

            //var hMapUrl = "./assets/heightmaps/Botswana.png";
            var hMapUrl = "./assets/heightmaps/NullHeight.png";
            // count of image borderlines - only used for lod
            var count = 1;
            var hMap = new Image();
            Levels.loadImage(hMap, hMapUrl, count, function(){
                var imagedata = Levels.getImageData(hMap);

                var size = 1024;
                var faces = 128;
                var shape = new THREE.PlaneGeometry(size, size, faces, faces);
                var grass = THREE.ImageUtils.loadTexture( './assets/textures/SoilSand0216_5_S.jpg' );
                //var grassNormal = THREE.ImageUtils.loadTexture( './assets/textures/SoilSand0216_5_S_NRM.png' );
                grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
                grass.repeat.set(64, 64);
                //grassNormal.wrapS = grassNormal.wrapT = THREE.RepeatWrapping;
                //grassNormal.repeat.set(64, 64);
                //var cover = new THREE.MeshLambertMaterial({map: grass, side: 2});
                var cover = new THREE.MeshPhongMaterial({
                    map: grass,
                    //normalmap: grassNormal,
                    side: 2
                });

                var vAmountX = faces+1;
                var vAmountY = faces+1;
                var multX = hMap.width / vAmountX;
                var multY = hMap.height / vAmountY;
                var scale = 50;

                count = 0;
                for (var i = 0; i < vAmountY; ++i) {
                    for (var j = 0; j < vAmountX; ++j) {
                        var color = Levels.getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
                        shape.vertices[i*vAmountX + j].z = ((color.r/255 + color.g/255 + color.b/255)/3)*scale;
                        //ige.log(shape.vertices[i*vAmountX + j].z, count++, "client");
                    }
                }
                shape.vertices[0].z = 51;

                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var ground = new THREE.Mesh(shape, cover);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                //ground.castShadow = true;
                ground.position.set(0,0,0);
                ground.name = "level";

                // create scenery
                var savannahGrassTexture = new THREE.ImageUtils.loadTexture( './assets/textures/scenery/Savanna_Grass.png' );
                var savannahGrassGeomMED = new THREE.PlaneGeometry(1,1);
                var savannahGrassGeomHIG = ige.three._loader.parse(modelAngle60).geometry;
                var savannahGrassLODMeshes = [];

                var savannahGrassSpriteMat = new THREE.SpriteMaterial({
                    //color: 0xffffff,
                    map: savannahGrassTexture,
                    useScreenCoordinates: false,
                    transparent: true,
                    depthWrite: false
                    //depthTest: false
                });

                var savannahGrassMat = new THREE.MeshLambertMaterial({
                    //color: 0xffffff,
                    map: savannahGrassTexture,
                    side: 2,
                    transparent: true,
                    depthWrite: false
                    //depthTest: false
                });

                /*for(var i=0; i<ground.geometry.vertices.length; ++i){
                    // low
                    var lod = new THREE.LOD();
                    var savannahGrassMeshLOW = new THREE.Mesh();
                    savannahGrassMeshLOW.updateMatrix();
                    savannahGrassMeshLOW.matrixAutoUpdate = false;
                    // medium
                    var savannahGrassMeshMED = new THREE.Mesh(savannahGrassGeomMED, savannahGrassMat);
                    if(i==4){
                        console.log('test');
                        savannahGrassMeshMED = new THREE.Mesh(savannahGrassGeomMED, new THREE.MeshBasicMaterial({color: 0xff0000, side: 2}));
                    };
                    savannahGrassMeshMED.name = "med";
                    savannahGrassMeshMED.rotation.x = Math.PI * 0.5;
                    savannahGrassMeshMED.position.z += savannahGrassGeomMED.height * 0.5;

                    savannahGrassMeshMED.updateMatrix();
                    savannahGrassMeshMED.matrixAutoUpdate = false;
                    // high
                   var savannahGrassMeshHIG = new THREE.Mesh(savannahGrassGeomHIG, savannahGrassMat);
                    savannahGrassMeshHIG.rotation.x = Math.PI * 0.5;
                    savannahGrassMeshHIG.position.z += savannahGrassGeomMED.height * 0.5;
                    savannahGrassMeshHIG.updateMatrix();
                    savannahGrassMeshHIG.matrixAutoUpdate = false;

                    lod.addLevel(savannahGrassMeshHIG, 5);
                    lod.addLevel(savannahGrassMeshMED, 15);
                    lod.addLevel(savannahGrassMeshLOW, 100);

                    lod.position.x = ground.geometry.vertices[i].x;
                    lod.position.y =  ground.geometry.vertices[i].y;
                    lod.position.z = ground.geometry.vertices[i].z;

                    lod.updateMatrix();
                    lod.matrixAutoUpdate = false;

                    ground.add(lod);
                    savannahGrassLODMeshes.push(lod);
                }*/

                //Create grass
                var grassPositions = new Float32Array( 300 );
                var amountOfShapeVertices = shape.vertices.length;
                for (var x = 0; x < grassPositions.length / 3; x++) {
                    //take a random vertice
                    var randomShapeVertice = shape.vertices[Math.floor(Math.random() * amountOfShapeVertices)]
                    grassPositions[x * 3] = randomShapeVertice.x;
                    grassPositions[x * 3 + 1] = randomShapeVertice.z;
                    grassPositions[x * 3 + 2] = randomShapeVertice.y;
                }
                var grass = new levelUtils.Grass(grassPositions);

                /*
                // Create the water effect

                 // water

                 var parameters = {
                 //width: 2000,
                 width: 10,
                 //height: 2000,
                 height: 10,
                 widthSegments: 1,
                 heightSegments: 1,
                 depth: 50,
                 param: 4,
                 filterparam: 1
                 };

                 // Load textures
                 var waterNormals = new THREE.ImageUtils.loadTexture( './assets/textures/waternormals.jpg' );
                 waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping;

                watershader = new THREE.Water( ige._threeRenderer, ige._currentCamera._threeObj, ige.client.scene1._threeObj, {
                    textureWidth: 512,
                    textureHeight: 512,
                    waterNormals: waterNormals,
                    alpha: 	0.85,
                    //sunDirection: sunlight.position.normalize(),
                    sunDirection: new THREE.Vector3(10,10,10).normalize(),
                    sunColor: 0xffffff,
                    //waterColor: 0x001e0f,
                    waterColor: 0xffffff,
                    distortionScale: 50.0
                } );

                watershader.material.side = 2;

                var aMeshMirror = new THREE.Mesh(
                    new THREE.PlaneGeometry( parameters.width * 50, parameters.height * 50, 10, 10 ),
                    watershader.material
                );
                aMeshMirror.add( watershader );
                aMeshMirror.rotation.x = - Math.PI * 0.5;
                aMeshMirror.position.y += 20;
                ige.client.scene1._threeObj.add(aMeshMirror);

                 */

                ground.position.set(0,0,0);
                ige.client.scene1._threeObj.add(ground);

                // update content
                    ige.addBehaviour('updateContent', function(){
                        /*
                         //watershader.material.uniforms.time.value += ige._tickDelta/1000;
                         //watershader.render();
                         */
                        for(var i=0; i<savannahGrassLODMeshes.length; ++i){
                            savannahGrassLODMeshes[i].update(ige._currentCamera._threeObj);
                            if(savannahGrassLODMeshes[i].children[0].name == 'med'){
                                // carefull y and z are switched
                                var v1 = new THREE.Vector3(savannahGrassLODMeshes[i].position.x,0, savannahGrassLODMeshes[i].position.y);
                                var v2 = new THREE.Vector3(ige._player._threeObj.position.x, 0, ige._player._threeObj.position.z);
                                var angle = Math.acos(v1);
                                savannahGrassLODMeshes[i].children[0].updateMatrix();
                                savannahGrassLODMeshes[i].children[0].matrixAutoUpdate = false;
                            }
                        }
                    });
            });
        }

        new Rock1(new THREE.Vector3(28, -2, 0), 3);

        new MainBuildingLizards('mainBuildingLizards', new THREE.Vector3(-20, 2, 20));

        new RockGold1(new THREE.Vector3(5, -2, 6), 4);
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