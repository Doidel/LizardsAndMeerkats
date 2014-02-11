var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;

		// Define an object to hold references to our player entities
		this.players = {};

        this.commanders = {
            lizards: undefined,
            meerkats: undefined
        }; //contains clientId from the player who's commander

        this.gameStates = {
            playerCounts: {
                lizards: 0,
                meerkats: 0
            }
        };
		
		this.gameOptions = {
			networkLevelRoomSize: 10,
			networkLevelRoomCheckInterval: 500
		}

        this.levelObjects = {
            goldRocks: [],
			buildings: []
        };

		// Add the server-side game methods / event handlers
		this.implement(ServerNetworkEvents);

		// Add the networking component
		ige.addComponent(IgeNetIoComponent)
			// Start the network server
			.network.start(2000, function () {
				// Networking has started so start the game engine
				ige.start(function (success) {
					// Check if the engine started successfully
					if (success) {
						// Create some network commands we will need
						ige.network.define('playerEntity', self._onPlayerEntity);

						ige.network.define('playerControlLeftDown', self._onPlayerLeftDown);
						ige.network.define('playerControlRightDown', self._onPlayerRightDown);
						ige.network.define('playerControlForwardsDown', self._onPlayerForwardsDown);
                        ige.network.define('playerControlBackwardsDown', self._onPlayerBackwardsDown);
                        ige.network.define('playerControlJumpDown', self._onPlayerJumpDown);
                        ige.network.define('playerControlBlockDown', self._onPlayerBlockDown);
                        ige.network.define('playerControlChargeLeapDown', self._onPlayerChargeLeapDown);
                        ige.network.define('playerControlAttackDown', self._onPlayerAttackDown);
                        ige.network.define('playerControlNumKeyDown', self._onPlayerNumKeyDown);

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlForwardsUp', self._onPlayerForwardsUp);
                        ige.network.define('playerControlBackwardsUp', self._onPlayerBackwardsUp);
                        ige.network.define('playerControlJumpUp', self._onPlayerJumpUp);
                        ige.network.define('playerControlBlockUp', self._onPlayerBlockUp);
                        ige.network.define('playerControlChargeLeapUp', self._onPlayerChargeLeapUp);
                        ige.network.define('playerControlNumKeyUp', self._onPlayerNumKeyUp);
                        ige.network.define('playerControlBuildUp', self._onPlayerBuildUp);

                        ige.network.define('playerControlRotation', self._onPlayerRotation);
                        ige.network.define('playerTakesCommand', self._onPlayerTakesCommand);
                        ige.network.define('playerFinalBuild', self._onPlayerFinalBuild);
                        ige.network.define('playerPlayVoiceCommand', self._onPlayerPlayVoiceCommand);
						
                        ige.network.define('changeBuildingColor');
                        ige.network.define('setStreamBuildingBuildable');

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(1000 / 50) // Send a stream update once every x milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.scene1 = new StreamScene()
							.id('scene1')
							.streamMode(1);

                        self.scene1._threeObj = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
                        self.scene1._threeObj.setGravity(new THREE.Vector3(0, -20, 0));
                        self.scene1._threeObj.fog = new THREE.FogExp2(0x000000, 0.05);
                        ige.addBehaviour('physiStep', self.physibehaviour);

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.scene1)
							.drawBounds(true)
							.mount(ige);

                        //Instantiate Level and World

                        self.implement(Levels);

                        // World details
                        ige.gameWorld = {
                            //level: self.level1()
                            level: self.level2()
                        };
					}
				});
			});
	},
    getCommander: function(faction) {
        if (this.commanders[faction] != undefined) {
            var p = this.players[this.commanders[faction]];
            if (p != undefined) return p;
        }
        return false;
    },
	//TODO: Create an always streamed entity where no transform will be streamed. 
    addStreamDataToAll: function(id, data) {
		ige.server.scene1.addStreamData(id, data);
    },
    physibehaviour: function (ctx) {
        ige.server.scene1._threeObj.simulate(); //ige._tickDelta/1000, 5
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }