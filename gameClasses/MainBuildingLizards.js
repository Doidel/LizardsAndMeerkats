var MainBuildingLizards = Building.extend({
    classId: 'MainBuildingLizards',

    init: function (id, position) {
        Building.prototype.init.call(this, id);

        if (!ige.isServer) {
            var geom = ige.three._loader.parse(modelBuildingLizard).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var mat = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/BuildingLizardTextureSmall.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            this._threeObj = new THREE.Mesh(
                geom,
                mat
            );

            this._threeObj.receiveShadow = true;
            this._threeObj.castShadow = true;

            /* adding stairs */
            var geomStairs = ige.three._loader.parse(modelBuildingStairsLizard).geometry;
            var matStairs = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/BuildingLizardStairsTexture.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var stairs = [];
            for(var i=0; i<4; ++i){
                stairs.push(new THREE.Mesh(
                    geomStairs,
                    matStairs
                ));
                stairs[i].receiveShadow = true;
                stairs[i].castShadow = true;
            }

            stairs[0].position = new THREE.Vector3(0, 0, 4.65);

            stairs[1].rotation.y = Math.PI/2;
            stairs[1].position = new THREE.Vector3(3.26, 0, 1.5);

            stairs[2].rotation.y = Math.PI/2;
            stairs[2].position = new THREE.Vector3(3.26, 0, -1.5);

            stairs[3].rotation.y = Math.PI;
            stairs[3].position = new THREE.Vector3(0, 0, -4.65);
            for(var i=0; i<4; ++i){
                this._threeObj.add(stairs[i]);
            }

            /* adding laterns */
            var geomLatern = ige.three._loader.parse(modelBuildingLaternLizard).geometry;
            var matLatern = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/BuildingLizardLaternTexture.png' ),
                side: 2
            });

            var laterns = [];
            for(var i=0; i<10; ++i){
                laterns.push(new THREE.Mesh(
                    geomLatern,
                    matLatern
                ));
                laterns[i].receiveShadow = true;
                laterns[i].castShadow = true;
            }

            laterns[0].position = new THREE.Vector3(1.34, 2.36, 3.45);
            laterns[1].position = new THREE.Vector3(-1.34, 2.36, 3.45);

            laterns[2].rotation.y = Math.PI;
            laterns[3].rotation.y = Math.PI;
            laterns[2].position = new THREE.Vector3(1.34, 2.36, -3.45);
            laterns[3].position = new THREE.Vector3(-1.34, 2.36, -3.45);

            laterns[4].rotation.y = Math.PI/2;
            laterns[5].rotation.y = Math.PI/2;
            laterns[6].rotation.y = Math.PI/2;
            laterns[4].position = new THREE.Vector3(2.07, 2.36, 2.735);
            laterns[5].position = new THREE.Vector3(2.07, 2.36, 0);
            laterns[6].position = new THREE.Vector3(2.07, 2.36, -2.735);

            laterns[7].rotation.y = (Math.PI*3)/2;
            laterns[8].rotation.y = (Math.PI*3)/2;
            laterns[9].rotation.y = (Math.PI*3)/2;
            laterns[7].position = new THREE.Vector3(-2.07, 2.36, 2.735);
            laterns[8].position = new THREE.Vector3(-2.07, 2.36, 0);
            laterns[9].position = new THREE.Vector3(-2.07, 2.36, -2.735);

            for(var i=0; i<10; ++i){
                this._threeObj.add(laterns[i]);
            }

            //ige.client.scene1._threeObj.add(this._threeObj);
            this.mount(ige.client.scene1);
        }

        if (ige.isServer) {
            var stoneMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                .6, // low friction
                .2 // high restitution
            );

            var geom = new THREE.CubeGeometry(4.785, 8.52, 7.557);
            geom.computeBoundingBox();
            var halfHeight = (geom.boundingBox.max.y - geom.boundingBox.min.y) / 2;
            geom.boundingBox.max.y -= halfHeight;
            geom.boundingBox.min.y -= halfHeight;

            this._threeObj = new Physijs.BoxMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            if (this._id.indexOf('Stream') == -1) this.activatePhysics();

            this.mount(ige.server.scene1);
        }

        if (position) {
            //when created by stream position can be undefined
            this._threeObj.position = position;
            this.translateTo(position.x, position.y, position.z);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = MainBuildingLizards; }