var PlayerCommanderComponent = Player.extend({
    classId: 'PlayerCommanderComponent',
	componentId: 'commander',

    init: function (player, options) {
		this._player = player;
        // add hat
        var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
        var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});
        var hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.0;

        this._player._threeObj.add(hat);

        // initialize object to perform world/screen calculations
        //this.projector = new THREE.Projector();
        // if he is in the building mode
        this.isInBuildingMode = false;
        this.buildingObject;
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
			} else {
				//Deselect the key, graphical stuff, etc.
			}
			this._player.states.buildingNr = -1;
		} else if (true) { //enough resources?
			this._player.states.buildingNr = buildingNr;
			if (ige.isServer) {
				//Select the building according to buildingNr
				//Create a streamed building entity in front of the player
				//the newly initialized Building.js calls isBuildable each tick on the server while it's not built
                console.log('create stream');
				this.streamedBuilding = new MainBuildingLizards(this._player.faction + 'StreamBuilding', new THREE.Vector3(0, 10, 0))
					.streamMode(1)
					.mount(ige.server.scene1);
				this.streamedBuilding.values.builderId = this._player._id;
                this.streamedBuilding.states.isBuilt = false;

			} else {
                //display " not enough resources "
			}
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
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    /*tick: function (ctx) {
        var self = this;

        Player.prototype.tick.call(this, ctx);

		
		//place logic now in Building.js:isBuildable
        if (!ige.isServer){

            // if he is in the building mode
            if (this.controls.build || this.isInBuildingMode) {

                //create the building object when he enters building mode
                if(!this.isInBuildingMode){
                    this.isInBuildingMode = true;
                    var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
                    var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});

                    this.buildingObject = new THREE.Mesh(hatGeometry, hatMaterial);
                    this.buildingObject.BottomPos = 0.125;
                    ige.client.scene1._threeObj.add(this.buildingObject);
                }

                var vec = new THREE.Vector3( 0, 0, -1 );
                vec.applyQuaternion( ige.client.vp1.camera._threeObj.quaternion );
                var angle = vec.angleTo( this._threeObj.position );

                var mouseYAddition = (3*Math.PI) / 4;
                mouseYAddition -= angle;

                // update the mouse variable
                var currentMousePos = { x: -1, y: -1 };
                var mouseX = window.innerWidth / 2;
                var mouseY = -window.innerHeight / 2;
                //var mouseY = -((window.innerHeight / 2) / (Math.PI / 2))*mouseYAddition;

                // find intersections

                // create a Ray with origin at the mouse position
                //   and direction into the scene (camera direction)
                var vector = new THREE.Vector3( mouseX, mouseY, 1 );
                this.projector.unprojectVector( vector, ige.client.vp1.camera._threeObj );

                //vector.sub( angle ).normalize();
                vector.sub( this._threeObj.position ).normalize();
                //vector.sub( position ).normalize();


                var axisY = new THREE.Vector3( 0, 1, 0 );
                var angleY = Math.PI / 2;
                var matrix = new THREE.Matrix4().makeRotationAxis( axisY, angleY );
                vector.applyMatrix4( matrix );

                var ray = new THREE.Raycaster( this._threeObj.position, vector );
                //var ray = new THREE.Raycaster( position, vector );
                //var ray = new THREE.Raycaster( ige.client.vp1.camera._threeObj.position, vector.sub(ige.client.vp1.camera._threeObj.position).normalize() );

                var count = 0;
                var found = false;
                var intersect;
                while(!found && count < ige.client.scene1._threeObj.children.length){
                    if(ige.client.scene1._threeObj.children[count].name == "level"){
                        // create an array containing all objects in the scene with which the ray intersects
                        intersect = ray.intersectObject( ige.client.scene1._threeObj.children[count] );
                        found = true;
                    }
                    ++count;
                }

                if(intersect[0]){
                    this.buildingObject.position = intersect[0].point;
                    this.buildingObject.position.y += this.buildingObject.BottomPos;
                    //console.log(this.buildingObject);
                    //this.buildingObject.needsUpdate();
                }
            }
        }
    },*/
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
		    this.placeBuilding(1);
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerCommanderComponent; }