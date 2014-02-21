var MainBuildingMeerkats = Building.extend({
    classId: 'MainBuildingMeerkats',

    init: function (position) {
        var id = 'mainBuildingMeerkats';
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

        //We need no transform for the main building
        this.streamSections(['setResources', 'startVote']);
        //this.streamSections(this._streamSections.concat(['setResources']));
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
        if (sectionId == 'setResources') {
            if (data) {
                data = JSON.parse(data);
                UI.resources.setResource(0, data[0]);
                UI.resources.setResource(1, data[1]);
            } else {
                return this._getJSONStreamActionData('setResources');
            }
        } else if (sectionId == 'startVote') {
            if (data) {
                data = JSON.parse(data);
                UI.voting.openDialog(data);
            } else {
                return this._getJSONStreamActionData('startVote');
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