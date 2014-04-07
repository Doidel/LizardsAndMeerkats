var MainBuildingLizards = Building.extend({
    classId: 'MainBuildingLizards',

    init: function (position) {
        var id = 'mainBuildingLizards';
        Building.prototype.init.call(this, id);
		
		this.faction = 'lizards';

        this.values = {
            gold: 0,
            woodOrStone: 0
        }

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
                //stairs[i].receiveShadow = true;
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


            /*
             // physobj
             var geomP = new THREE.CubeGeometry(4.785, 17.0, 7.557);
             var meshP = new THREE.Mesh(
             geomP,
             new THREE.MeshBasicMaterial({
             wireframe: true,
             color: 'red'
             })
             );

            this._threeObj.add(meshP);
            */

            //ige.client.scene1._threeObj.add(this._threeObj);
            this.mount(ige.client.scene1);
        }

        if (ige.isServer) {
            var stoneMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                .6, // low friction
                .2 // high restitution
            );

            var geom = new THREE.CubeGeometry(4.785, 17.0, 7.557);
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
            this._threeObj.name = "MainBuildingLizards";

            this.activatePhysics();

            this.mount(ige.server.scene1);

            ige.server.levelObjects[0] = this;
		
			//send only to members of the own faction
			this.streamControl(function (clientId) {
				if (ige.server.players[clientId] && ige.server.players[clientId].faction === 'lizards') {
					return true;
				} else {
					return false;
				}
			});

            this.streamMode(1);
            this.streamSyncInterval(1000 / 3);
        }

        if (position) {
            //when created by stream position can be undefined
            this._threeObj.position = position;
            this.translateTo(position.x, position.y, position.z);
        }
		
		//Attention:
		//this stream is for streaming to lizard players only

        // Define the data sections that will be included in the stream
        this._streamActionSections = ['startVote','chatMessages'];
        //We need no transform for the main building
        this.streamSections(['goldResource', 'stoneResource'].concat(this._streamActionSections));
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
                data = parseInt(data);
                this.values.gold = data;
                UI.resources.setResourceTeam(1, data);
            }
        } else if(sectionId == 'stoneResource') {
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
                else if (sectionId == 'chatMessages') {
                    UI.chat.addMessage(data[0], data[1], data[2]);
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
		Building.prototype.tick.call(this, ctx);
	},

    sendChatMessage: function(data) {
        this.addStreamData('chatMessages', [data.type, data.playerName, data.text], true);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = MainBuildingLizards; }