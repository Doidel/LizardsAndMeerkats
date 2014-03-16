var Level2 = IgeClass.extend({
    classId: 'Level2',

    init: function () {
        /*
         Consider that the level mesh is rotated to ensure, the physijs is working correctly.
         - Height will be applied at the Z - axis
         - Depth will be applied at the Y -  axis
         - --> Y and Z are switched!
         */
        if (ige.isServer) {
            //var hMapUrl = "./assets/heightmaps/NullHeight.png";
            var hMapUrl = "./assets/heightmaps/Botswana.png";
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
                        //var color = LevelUtils.getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
                        //var position = ( x + imagedata.width * y ) * 4;
                        shape.vertices[i*vAmountX + j].z = ((pixels[pixelIndex]/255 + pixels[pixelIndex + 1]/255 + pixels[pixelIndex + 2]/255)/3)*scale;
                    }
                }
                //shape.vertices[8320].z = -10;
                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var groundmat = Physijs.createMaterial(
                    new THREE.MeshBasicMaterial(),
                    0.99, // high friction
                    0.01 // low restitution
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
            var hMapUrl = "./assets/heightmaps/Botswana.png";
            //var hMapUrl = "./assets/heightmaps/NullHeight.png";
            // count of image borderlines - only used for lod
            var count = 1;
            var size = 1024;
            var faces = 128;
            UI.minimap.levelDimensions = size;

            var hMap = new Image();
            LevelUtils.loadImage(hMap, hMapUrl, count, function(){
                var imagedata = LevelUtils.getImageData(hMap);
                var shape = new THREE.PlaneGeometry(size, size, faces, faces);
                var grass = THREE.ImageUtils.loadTexture( './assets/textures/SoilSand0216_5_S.jpg' );
                //var grassNormal = THREE.ImageUtils.loadTexture( './assets/textures/SoilSand0216_5_S_NRM.png' );
                grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
                grass.repeat.set(64, 64);
                //grassNormal.wrapS = grassNormal.wrapT = THREE.RepeatWrapping;
                //grassNormal.repeat.set(64, 64);
                //var cover = new THREE.MeshLambertMaterial({map: grass, side: 2});
                var cover = new THREE.MeshPhongMaterial({
                    map: grass
                    //normalmap: grassNormal,
                    //side: 2
                });

                var vAmountX = faces+1;
                var vAmountY = faces+1;
                var multX = hMap.width / vAmountX;
                var multY = hMap.height / vAmountY;
                var scale = 50;

                count = 0;
                //shape.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
                for (var i = 0; i < vAmountY; ++i) {
                    for (var j = 0; j < vAmountX; ++j) {
                        var color = LevelUtils.getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
                        shape.vertices[i*vAmountX + j].z = ((color.r/255 + color.g/255 + color.b/255)/3)*scale;
                    }
                }
                //shape.vertices[0].y = 51;

                shape.computeFaceNormals();
                shape.computeVertexNormals();
                var ground = new THREE.Mesh(shape, cover);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                //ground.castShadow = true;
                ground.position.set(0,0,0);
                ground.name = "level";

                // create scenery
                var savannahGrassLODMeshes = [];

                //Create grass
                var grassPositions = new Float32Array( 30000 );
                var amountOfShapeVertices = shape.vertices.length;
                for (var x = 0; x < grassPositions.length / 3; x++) {
                    //take a random vertice
                    var randomShapeVertice = shape.vertices[Math.floor(Math.random() * amountOfShapeVertices)]
                    grassPositions[x * 3] = randomShapeVertice.x;
                    grassPositions[x * 3 + 1] = randomShapeVertice.z + 0.5;
                    grassPositions[x * 3 + 2] = -randomShapeVertice.y;
                }
                var grass = new LevelUtils.Grass(grassPositions, ground);

                // Create trees
                var camelthornGeometry = ige.three._loader.parse(modelCamelthorn).geometry;
                var camelthornLeavesGeometry = ige.three._loader.parse(modelCamelthornLeaves).geometry;

                var camelthornBarkTexture = new THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark.jpg' );
                camelthornBarkTexture.wrapS = camelthornBarkTexture.wrapT = THREE.RepeatWrapping;
                //camelthornBarkTexture.repeat.set(64, 64);
                var camelthornBarkTextureNRM = new THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark_NRM.jpg' );
                camelthornBarkTextureNRM.wrapS = camelthornBarkTextureNRM.wrapT = THREE.RepeatWrapping;
                //camelthornBarkTextureNRM.repeat.set(64, 64);
                var camelthornLeavesTexture = new THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornLeaves.png' );

                var camelthornBarkMat = new THREE.MeshPhongMaterial({
                    //color: 0xffffff,
                    map: camelthornBarkTexture,
                    normalmap: camelthornBarkTextureNRM,
                    side: 2
                });

                var camelthornLeavesMat = new THREE.MeshLambertMaterial({
                    //color: 0xffffff,
                    map: camelthornLeavesTexture,
                    side: 2,
                    transparent: true,
                    depthWrite: false
                });

                var camelthorn = new THREE.Mesh(camelthornGeometry, camelthornBarkMat);
                //camelthorn.receiveShadow = true;
                //camelthorn.castShadow = true;
                //camelthorn.position.set(0,200,0);
                //camelthorn.rotation.x = Math.PI /2;
                camelthorn.position.set(0,0,ground.geometry.vertices[parseInt(8320)].z);
                //camelthorn.scale.set(10, 10, 10);
                camelthorn.name = 'Camelthorn';

                // add leaves
                var leavesAmount = 19;
                var leavesPositions = new Array();
                var leavesRotations = new Array();
                leavesPositions[0] = new THREE.Vector3(-2.12923, -1.65601, 2.66333);
                leavesRotations[0] = 0.141829;
                leavesPositions[1] = new THREE.Vector3(-2.94144, -0.37996, 2.60743);
                leavesRotations[1] = 1.390845;
                leavesPositions[2] = new THREE.Vector3(-3.08328, 0.38842, 3.01996);
                leavesRotations[2] = 1.390845;
                leavesPositions[3] = new THREE.Vector3(-2.80233, 2.73413, 3.25665);
                leavesRotations[3] = 0.521703;
                leavesPositions[4] = new THREE.Vector3(-2.61231, 4.82561, 3.79929);
                leavesRotations[4] = 0.491529;
                leavesPositions[5] = new THREE.Vector3(-0.04198, -2.72764, 3.55406);
                leavesRotations[5] = 0.120163;
                leavesPositions[6] = new THREE.Vector3(-0.28394, -0.26194, 3.63871);
                leavesRotations[6] = 1.183909;
                leavesPositions[7] = new THREE.Vector3(-1.05416, 1.1401, 3.94454);
                leavesRotations[7] = 0.407492;
                leavesPositions[8] = new THREE.Vector3(-0.91585, 2.20641, 4.16523);
                leavesRotations[8] = 0.681693;
                leavesPositions[9] = new THREE.Vector3(-0.66934, 4.19387, 3.32211);
                leavesRotations[9] = 0.232447;
                leavesPositions[10] = new THREE.Vector3(1.51587, -1.77674, 2.85479);
                leavesRotations[10] = -0.589074;
                leavesPositions[11] = new THREE.Vector3(2.2324, -1.26442, 3.71287);
                leavesRotations[11] = -1.166013;
                leavesPositions[12] = new THREE.Vector3(0.90551, 1.64486, 3.83025);
                leavesRotations[12] = -0.807504;
                leavesPositions[13] = new THREE.Vector3(1.52818, 4.54722, 3.79929);
                leavesRotations[13] = -0.343747;
                leavesPositions[14] = new THREE.Vector3(4.08731, -2.08478, 3.7624);
                leavesRotations[14] = -0.454375;
                leavesPositions[15] = new THREE.Vector3(2.97383, 1.57733, 3.92464);
                leavesRotations[15] = -Math.PI/2;
                leavesPositions[16] = new THREE.Vector3(2.52386, 3.46093, 3.4032);
                leavesRotations[16] = -0.637328;
                leavesPositions[17] = new THREE.Vector3(5.9039, -0.64078, 3.404);
                leavesRotations[17] = -Math.PI/2;
                leavesPositions[18] = new THREE.Vector3(3.77763, 1.94523, 2.86499);
                leavesRotations[18] = -0.687253;
                var leavesMaxScale = 1.2;
                var leavesMinScale = 0.8;
                var leavesContainer = [];
                for(var i=0; i<leavesAmount; ++i){
                    var mesh = new THREE.Mesh(camelthornLeavesGeometry, camelthornLeavesMat);
                    //mesh.rotateY = leavesRotations[i];
                    mesh.name = 'leave';
                    mesh.rotation.z = Math.PI + leavesRotations[i];
                    mesh.position = leavesPositions[i];
                    camelthorn.add(mesh);
                }
                ground.add(camelthorn);

                //Create camelthorn particle
                var camelthornPositions = new Float32Array( 30000 );
                //var amountOfShapeVertices = shape.vertices.length;
                for (var x = 0; x < camelthornPositions.length / 3; x++) {
                    //take a random vertice
                    var randomShapeVertice = shape.vertices[Math.floor(Math.random() * amountOfShapeVertices)]
                    camelthornPositions[x * 3] = randomShapeVertice.x;
                    camelthornPositions[x * 3 + 1] = randomShapeVertice.y;
                    camelthornPositions[x * 3 + 2] = randomShapeVertice.z + 0.5;
                }
                var camelthorns = new LevelUtils.Camelthorn(camelthornPositions, ground);

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

                //ground.position.set(0,0,0);
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

        new MainBuildingLizards(new THREE.Vector3(-280, 29.6, 280));

        new MainBuildingMeerkats(new THREE.Vector3(280, 29.6, -280));

        new OutpostLizards('outpostLizard1', new THREE.Vector3(-280, 29.6, 270));

        new OutpostMeerkats('outpostMeerkat1', new THREE.Vector3(280, 29.6, -270));

        //new Rock1(new THREE.Vector3(280, 29.6 - 1.5, -270), 3);

        //new RockGold1(new THREE.Vector3(270, 29.6 - 2, -280), 4);

        new GoldOre('goldOre1', new THREE.Vector3(275, 29.6, -285));

        //new GoldmineBuildingLizard('goldmineBuildingLizard1', new THREE.Vector3(275, 29.6, -285));

        //new GoldmineBuildingMeerkat('goldmineBuildingMeerkat1', new THREE.Vector3(275, 29.6, -285));
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Level2; }