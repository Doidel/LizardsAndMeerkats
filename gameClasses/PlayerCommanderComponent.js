var PlayerCommanderComponent = IgeClass.extend({
    classId: 'PlayerCommanderComponent',
	componentId: 'commander',

    init: function (player, options) {
		this._player = player;
        
		if (!ige.isServer) {
			// add hat
			var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
			var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});
			this._hat = new THREE.Mesh(hatGeometry, hatMaterial);
			this._hat.position.y = 1.0;

			this._player._threeObj.add(this._hat);
		}
		
		// if he is in the building mode
        this.isInBuildingMode = false;
		this._player.states.buildingNr = -1;
		
		
		/*this._streamBuidlingEventListener = ige.network.stream.on('entityCreated', function (entity) {
			if (entity.id() === 'lizardsStreamBuilding') {
				
			}
		});*/
    },
    // place command building
    placeBuilding: function(buildingNr){
        //Roman's build streaming
		if (buildingNr == this._player.states.buildingNr) {
			//The building is already selected now he pressed the same key again ==> player wants to deselect it
			if (ige.isServer) {
				//Destroy the stream object
                if (this.streamedBuilding) this.streamedBuilding.destroy();
			} else {
				//Deselect the key, graphical stuff, etc.
                //UI.buildingMenu.displayPressed(this._player.states.buildingNr, false);
			}
			this._player.states.buildingNr = -1;
		}
        else if (true) //enough resources?
        {

			if (ige.isServer) {

                //If a building is already streamed destroy it, and create the new one afterwards.
                if (this.streamedBuilding) this.streamedBuilding.destroy();

				//Select the building according to buildingNr
				//Create a streamed building entity in front of the player
				//the newly initialized Building.js calls isBuildable each tick on the server while it's not built
                if (this._player.faction == 'lizards') {
				    this.streamedBuilding = new OutpostLizards(undefined, new THREE.Vector3(0, 10, 0), true);
                } else {
                    this.streamedBuilding = new OutpostMeerkats(undefined, new THREE.Vector3(0, 10, 0), true);
                }

                this.streamedBuilding
                    .streamMode(1)
					.mount(ige.server.scene1);
				this.streamedBuilding.values.builderId = this._player._id;
                this.streamedBuilding.states.isBuilt = false;
				this._player.levelRoom.attachEntity(this.streamedBuilding);
			}
            this._player.states.buildingNr = buildingNr;

		} else if (!ige.isServer) {
            //display " not enough resources "
        }
    },
	finalPlaceBuilding: function() {
        //method is called by player.js left click
		//finally place the building at its current position.
		if (!ige.isServer) {
		    //send network event to the server to call Building.js: finalPlaceBuilding
            ige.network.send('playerFinalBuild');
		} else {
			this.streamedBuilding.finalPlaceBuilding();
		}
	},
    toggleBuildingMode: function() {
        if (!ige.isServer) {
            this._player.states.isBuilding = !this._player.states.isBuilding;
            // toggle buildingMenu
			UI.buildingMenu.display(this._player.states.isBuilding);
			// Tell the server about our control change
            ige.network.send('playerControlBuildUp');
            // 0..9 key buttons will then select a building
			
            // (when a button is pressed while isBuilding: call placeBuilding to create the green/red building)
        } else {
            this._player.states.isBuilding = !this._player.states.isBuilding;
        }
    },
	_numKeyChanged: function(keyNr, isUp) {
		//Define how to react to a number (0..9) pressed

		if (isUp) {
            console.log('call placeBuilding');
		    this.placeBuilding(keyNr);
		}
	},
	destroy: function () {
		//do something before we're gone
		if (!ige.isServer) {
			this._player._threeObj.remove(this._hat);
		}
		
        this.isInBuildingMode = false;
		this._player.states.buildingNr = -1;
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerCommanderComponent; }