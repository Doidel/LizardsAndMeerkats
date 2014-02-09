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
		if (ige.$(data)) {
			ige.client.vp1.camera.trackTranslate(ige.$(data), 50);
		} else {
			// The client has not yet received the entity via the network
			// stream so lets ask the stream to tell us when it creates a
			// new entity and then check if that entity is the one we
			// should be tracking!
			var self = this;
			self._eventListener = ige.network.stream.on('entityCreated', function (entity) {
				if (entity.id() === data) {
					// Tell the camera to track out player entity
					//ige.client.vp1.camera.trackTranslate(ige.$(data), 0);
                    console.log('entity created');
                    var entity = ige.$(data);

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



                    if (entity.__threeSunlight == undefined) {
                        console.log('create sunlight...');
                        //directional light
                        var sunlight = new THREE.DirectionalLight(0xFFFAAD, 0.7);
                        sunlight.position.set(0, 10, 2);
                        sunlight.shadowDarkness = 0.7;
                        sunlight.castShadow = true;
                        //sunlight.shadowCameraVisible = true;
                        sunlight.target = entity._threeObj;

                        sunlight.shadowCameraLeft = -6;
                        sunlight.shadowCameraRight = 6;
                        sunlight.shadowCameraTop = 10;
                        sunlight.shadowCameraBottom = -2;
                        sunlight.shadowCameraNear = 5;
                        sunlight.shadowCameraFar = 15;

                        sunlight.shadowMapWidth = 1024;
                        sunlight.shadowMapHeight = 1024;

                        entity._threeObj.add( sunlight );
                        entity.__threeSunlight = sunlight;

                        /*sunlight.shadowDarkness = 0.6;
                         sunlight.shadowBias = 0.000065;*/

                        /*sunlight.shadowCascade = true;
                         sunlight.shadowCascadeCount = 3;
                         sunlight.shadowCascadeNearZ = [ -1.000, 0.995, 0.998 ];
                         sunlight.shadowCascadeFarZ  = [  0.995, 0.998, 1.000 ];
                         sunlight.shadowCascadeWidth = [ 1024, 1024, 1024 ];
                         sunlight.shadowCascadeHeight = [ 1024, 1024, 1024 ];*/

                        //sunlight.shadowCascadeOffset.set( 0, 0, -10 );
                        //sunlight.lookAt(new THREE.Vector3(0,0,0));

                        //self.scene1._threeObj._defaultLight = sunlight;
                    }

                    if (ige.client.vp1.scene() == undefined) {
                        ige.client.vp1.scene(ige.client.scene1);
                    }

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
	},
    _onPlayersTakeHit: function (data) {
		//revamped
    },
    _onUpdateHealth: function (data) {
		//revamped
    },
    _onPlayerHarvest: function (data) 
		//revamped
    },
    _onPlayerAttributeUpdate: function (data) {
		//revamped
    },
    /**
     * Set the model (faction + unit type) and display an animation
     */
    _onPlayerSpawn: function(data) {
        console.log(data.player);
        var p = ige.$(data.player);
        p.faction = data.faction;
        console.log('playerSpawn');
        p._setPlayerModel(data.faction, data.unit);
    },
    _onPlayerSetComponent: function(data) {
        var p = ige.$(data.player);
        if (p != undefined) {
            if (data.add !== false) {
                p.addComponent(window[data.component]);
            } else {

            }
        }
    },
    _onSetStreamedBuildingBuildable: function(data) {
        var streamBuilding = ige.$(data.id);
        if (streamBuilding) streamBuilding.isBuildable(data.color);
    },
    _onPlayVoiceCommand: function(data) {
        //revamped
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }