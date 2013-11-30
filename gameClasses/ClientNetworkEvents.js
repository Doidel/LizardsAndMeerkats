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

                    var entity = ige.$(data);

                    ige._player = entity;

                    ige.client.vp1.camera.mount(entity);

                    ige.client.vp1.camera.rotateTo(-30*(Math.PI/180),0,0); //180*(Math.PI/180)

                    var onMouseMove = function ( event ) {

                        if (!ige.client.controls.enabled) return;

                        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                        //var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

                        //ige.client.vp1.camera.rotateBy(0,movementY * 0.002,0); //movementX * -0.002

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
                    }, false );

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
        for (var x = 0; x < data.hit.length; x++) {
            if (ige.$(data.hit[x])) {
                ige.$(data.hit[x]).takeDamage(data.rawDamage);
            }
        }
    },
    _onPlayerUpdateHealth: function (data) {
            if (ige.$(data.player)) {
                ige.$(data.player)._updateHealth(data.health);
            }
    },
    _onPlayerHarvest: function (data) {
        var p = ige.$(data.player);
        if (data.amount > 0) {
            p.states.isScratching = true;
            if (p._id == ige._player._id) UI.notifications.displayHarvest(data.amount);
        } else {
            p.states.isScratching = false;
        }
    },
    _onPlayerAttributeUpdate: function (data) {
        var p = ige.$(data.player);
        p[data.group][data.name] = data.value;
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ClientNetworkEvents; }