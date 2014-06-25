var ClientNetworkEvents = {
	/**
	 * Is called when a network packet with the "playerEntity" command
	 * is received by the client from the server. This is the server telling
	 * us which entity is our player entity so that we can track it with
	 * the main camera!
	 * @param data The data object that contains any data sent from the server.
	 * @private
	 */
	_onPlayerEntity: function (data) {
        var id = data[0];
        var playerList = data[1];

        //create entity
		if (ige.$(id)) {
			ige.client.vp1.camera.trackTranslate(ige.$(id), 50);
		} else {
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === id) {
					// Tell the camera to track out player entity
					//ige.client.vp1.camera.trackTranslate(ige.$(data), 0);
                    console.log('entity created');
                    var entity = ige.$(id);

                    ige._player = entity;

                    //ige.client.vp1.camera.mount(entity);

                    ige.client.vp1.camera.radius = 3;
                    ige.client.vp1.camera.currentAngle = Math.PI / 4;
                    ige.client.vp1.camera.rotateTo(-30*(Math.PI/180),0,0); //180*(Math.PI/180)

                    var onMouseMove = function ( event ) {

                        if (!ige.client.controls.enabled) return;

                        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

                        //for y, rotate with the camera around the player
                        var previousAngle = ige.client.vp1.camera.currentAngle;
                        var newAngle = previousAngle + movementY * -0.001;
                        var radius = ige.client.vp1.camera.radius;
                        if (newAngle >= 0.5 && newAngle <= 1.4) {

                            ige.client.vp1.camera.translateTo(0, radius * Math.cos(newAngle), radius * Math.sin(newAngle));
                            ige.client.vp1.camera.rotateBy(movementY * -0.001,0,0); //movementX * -0.002
                            ige.client.vp1.camera.currentAngle = newAngle;
                        }

                        ige.network.send('playerControlRotation', {movementX: movementX * -0.008});
                        /*yawObject.rotation.y -= movementX * 0.002;
                        pitchObject.rotation.x -= movementY * 0.002;*/

                        //pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
                    };

                    document.addEventListener( 'mousemove', onMouseMove, false );

                    ige.client.instantiatePointerLock();

                    document.addEventListener( 'mousewheel', function(event) {
                        if (!ige.client.controls.enabled) return;
                        var movementY = event.wheelDeltaY || event.wheelDelta || 0;
                        var modifierY = 1 + movementY * -0.001;
                        ige.client.vp1.camera._translate.x *= modifierY;
                        ige.client.vp1.camera._translate.y *= modifierY;
                        ige.client.vp1.camera._translate.z *= modifierY;
                        ige.client.vp1.camera.radius *= modifierY;
                    }, false );

                    if (ige.client.vp1.scene() == undefined) {
                        ige.client.vp1.scene(ige.client.scene1);
                    }


                    //events
                    window.addEventListener('mousedown', function(event){
                        if(ige.client.controls.enabled==true) {
                            var self = ige._player;
                            if (event.which == 1) {
                                // build mode
                                if(self.states.isBuilding && self.states.buildingNr >= 0){
                                    self.commander.finalPlaceBuilding();
                                }
                                //attack
                                else if (!self.controls.attack) {
                                    // Record the new state
                                    self.controls.attack = true;

                                    // Tell the server about our control change
                                    ige.network.send('playerControlAttackDown');
                                }
                            } else if (event.which == 2) {
                                //block
                                if (!self.controls.block && !self.states.dazed) {
                                    // Record the new state
                                    self.controls.block = true;

                                    // Tell the server about our control change
                                    ige.network.send('playerControlBlockDown');
                                }
                            } else if (event.which == 3) {
                                //chargeLeap
                                if (!self.controls.chargeLeap && !self.states.dazed) {
                                    // Record the new state
                                    self.controls.chargeLeap = true;

                                    self._threeObj.chargeElements.opacity = 0.7;

                                    // Tell the server about our control change
                                    ige.network.send('playerControlChargeLeapDown');
                                }
                            }

                        }
                    });

                    window.addEventListener('mouseup', function(event){
                        var self = ige._player;
                        if (event.which == 1) {
                            //attack
                            if (self.controls.attack) {

                                // Record the new state
                                self.controls.attack = false;
                            }
                        } else if (event.which == 2) {
                            //block
                            if (self.controls.block) {

                                // Record the new state
                                self.controls.block = false;

                                // Tell the server about our control change
                                ige.network.send('playerControlBlockUp');
                            }

                        } else if (event.which == 3) {
                            //chargeLeap
                            if (self.controls.chargeLeap) {
                                // Record the new state
                                self.controls.chargeLeap = false;

                                self._threeObj.chargeElements.opacity = 0;

                                // Tell the server about our control change
                                ige.network.send('playerControlChargeLeapUp');
                            }
                        }
                    });

                    UI.spawn.canSpawn(true);

					// Turn off the listener for this event now that we
					// have found and started tracking our player entity
					ige.network.stream.off('entityCreated', self._eventListener, function (result) {
						if (!result) {
							this.log('Could not disable event listener!', 'warning');
						}
					});
				}
			});
		}

        //fill in initial player overview tab
        UI.playerList.set(playerList);
	},
    _onSetStreamedBuildingBuildable: function(data) {
        var streamBuilding = ige.$(data.id);
        if (streamBuilding) {
            streamBuilding.isBuildable(data.color);
        }
    },
    _onSendNavMeshDebug: function(vertices) {
        console.log(vertices);

        new THREE.Object3D();
        var materials = [ new THREE.MeshNormalMaterial() ];

        for (var i = 0; i < vertices.length; i++) {
            if (!vertices[i+2]) { break; }

            var geometry = new THREE.ConvexGeometry([
                new THREE.Vector3(   vertices[i].x,   vertices[i].y,   vertices[i].z ),
                new THREE.Vector3( vertices[i+1].x, vertices[i+1].y, vertices[i+1].z ),
                new THREE.Vector3( vertices[i+2].x, vertices[i+2].y, vertices[i+2].z )
            ]);

            var child = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
            this.navigationMesh.add(child);

            i += 2;
        }
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }