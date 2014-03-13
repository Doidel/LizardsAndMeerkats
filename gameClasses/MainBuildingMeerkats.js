var MainBuildingMeerkats = Building.extend({
    classId: 'MainBuildingMeerkats',

    init: function (position) {
        var id = 'mainBuildingMeerkats';
        Building.prototype.init.call(this, id);

        this.values = {
            gold: 0,
            woodOrStone: 0
        }

        if (!ige.isServer) {
            var pillarTexture = THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark.jpg' );
            pillarTexture.wrapS = pillarTexture.wrapT = THREE.RepeatWrapping;
            var geomPillars = ige.three._loader.parse(modelBuildingMeerkatPillars).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matPillars = new THREE.MeshLambertMaterial({
                //map: THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark.jpg' ),
                map: pillarTexture,
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            this._threeObj = new THREE.Mesh(
                geomPillars,
                matPillars
            );

            // roof
            var geomRoof = ige.three._loader.parse(modelBuildingMeerkatRoof).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matRoof = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/meerkatRoofTextureMap2048.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var roof = new THREE.Mesh(
                geomRoof,
                matRoof
            );

            this._threeObj.add(roof);

            // floor
            var geomFloor = ige.three._loader.parse(modelBuildingMeerkatFloor).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matFloor = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/meerkatFloorTextureMap2048.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var floor = new THREE.Mesh(
                geomFloor,
                matFloor
            );

            this._threeObj.add(floor);

            var roof = new THREE.Mesh(
                geomRoof,
                matRoof
            );

            this._threeObj.add(roof);

            // stone
            var stoneTexture = THREE.ImageUtils.loadTexture( './assets/textures/scenery/meerkatStoneTextureMap.jpg' );
            stoneTexture.wrapS = stoneTexture.wrapT = THREE.RepeatWrapping;
            var geomStone = ige.three._loader.parse(modelBuildingMeerkatStone).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matStone = new THREE.MeshLambertMaterial({
                //map: THREE.ImageUtils.loadTexture( './assets/textures/scenery/meerkatStoneTextureMap.jpg' ),
                map: stoneTexture,
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var stone = new THREE.Mesh(
                geomStone,
                matStone
            );

            this._threeObj.add(stone);

            // stairs
            var geomStairs = ige.three._loader.parse(modelBuildingMeerkatStairs).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matStairs = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/meerkatStairsTextureMap2048.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var stairs = new THREE.Mesh(
                geomStairs,
                matStairs
            );

            this._threeObj.add(stairs);

            // voodoomask
            var geomVoodoo = ige.three._loader.parse(modelBuildingMeerkatVoodooMask).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matVoodoo = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/meerkatVoodooMaskTextureMap1024.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var voodoo = new THREE.Mesh(
                geomVoodoo,
                matVoodoo
            );

            // voodoomaskpillar
            var geomVoodooPillar = ige.three._loader.parse(modelBuildingMeerkatVoodooMaskPillar).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var matVoodooPillar = new THREE.MeshLambertMaterial({
                //map: THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark.jpg' ),
                map: pillarTexture,
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var voodooPillar = new THREE.Mesh(
                geomVoodooPillar,
                matVoodooPillar
            );
            voodooPillar.position.set(0,-1.7,0);

            voodoo.add(voodooPillar);
            voodoo.scale.set(0.5,0.5,0.5);
            voodoo.rotation.y -= Math.PI/16;
            voodoo.rotation.x += Math.PI/32;
            voodoo.position.set(2,1.25,2.75);

            this._threeObj.add(voodoo);

            // voodoomaskpillar 2

            var voodoo2 = new THREE.Mesh(
                geomVoodoo,
                matVoodoo
            );

            var voodooPillar2 = new THREE.Mesh(
                geomVoodooPillar,
                matVoodooPillar
            );
            voodooPillar2.position.set(0,-1.7,0);

            voodoo2.add(voodooPillar2);
            voodoo2.scale.set(0.6,0.6,0.6);
            voodoo2.rotation.y += Math.PI/8;
            voodoo2.rotation.x += Math.PI/16;
            voodoo2.position.set(-0.5,1.25,2.5);

            this._threeObj.add(voodoo2);

            // test physic objects
            var testgeom = new THREE.CubeGeometry(4.785, 8.52, 7.557);
            var testMesh = new THREE.Mesh(
                testgeom,
                matVoodooPillar
            );
            testMesh.name = 'testmesh';

            this._threeObj.add(testMesh);


            this._threeObj.receiveShadow = true;
            this._threeObj.castShadow = true;

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

            ige.server.levelObjects[1] = this;

			//send only to members of the own faction
			this.streamControl(function (clientId) {
				if (ige.server.players[clientId] && ige.server.players[clientId].faction === 'meerkats') {
					return true;
				} else {
					return false;
				}
			});
        }

        if (position) {
            //when created by stream position can be undefined
            this._threeObj.position = position;
            this.translateTo(position.x, position.y, position.z);
        }

        //Attention:
        //this stream is for streaming to meerkat players only

        // Define the data sections that will be included in the stream
        this._streamActionSections = ['startVote'];
        //We need no transform for the main building
        this.streamSections(['goldResource', 'woodResource'].concat(this._streamActionSections));

        this.streamMode(1);
    },

    /**
     * Override the default IgeEntity class streamSectionData() method
     * so that we can check for the custom1 section and handle how we deal
     * with it.
     * @param {String} sectionId A string identifying the section to
     * handle data get / set for.
     * @param {*=} data If present, this is the data that has been sent
     * from the server to the client for this entity.
     * @return {*}
     */
    streamSectionData: function (sectionId, data) {
        // Check if the section is one that we are handling
        if(sectionId == 'goldResource') {
            if(!data){
                if(ige.isServer){
                    return this.values.gold;
                } else {
                    return;
                }
            } else {
                console.log('set Resource team', data);
                data = parseInt(data);
                this.values.gold = data;
                UI.resources.setResourceTeam(1, data);
            }
        } else if(sectionId == 'woodResource') {
            if(!data){
                if(ige.isServer){
                    return this.values.woodOrStone;
                } else {
                    return;
                }
            } else {
                data = parseInt(data);
                this.values.woodOrStone = data;
                UI.resources.setResourceTeam(2, data);
            }
        } else if (this._streamActionSections.indexOf(sectionId) != -1) {
            if (!data) {
                if (ige.isServer) {
                    return this._getJSONStreamActionData(sectionId);
                } else {
                    return;
                }
            }
            var dataArr = JSON.parse(data);
            for (var dataId in dataArr) {
                data = dataArr[dataId];

                //execute section handlers
                if (sectionId == 'startVote') {
                    UI.voting.openDialog(data);
                }
            }
        } else {
            // The section was not one that we handle here, so pass this
            // to the super-class streamSectionData() method - it handles
            // the "transform" section by itself
            return Building.prototype.streamSectionData.call(this, sectionId, data);
        }
    },

    tick: function (ctx) {
        if (ige.isServer) {
            this._tickTimer += ige._tickDelta;
            if (this._tickTimer / 3000 > 1) {
                this._tickTimer -= 3000;
                this.addStreamData('setResources', [
                    ige.server.gameStates.gold['meerkats'],
                    ige.server.gameStates.woodOrStone['meerkats']
                ]);
            }
        }

        Building.prototype.tick.call(this, ctx);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = MainBuildingMeerkats; }