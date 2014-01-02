var Server = IgeClass.extend({
	classId: 'Server',
	Server: true,

	init: function (options) {
		var self = this;



        //ige.addComponent(IgeCannonComponent);
        //ige.cannon.createWorld();
        //ige.cannon.gravity(0, -40, 0); // m / s^2
        //ige.cannon._world.allowSleep = false;
        //ige.cannon.createFloor(0, 1, 0);

        /*var solver = new CANNON.GSSolver();
        solver.iterations = 7;
        solver.tolerance = 0.1;
        ige.cannon._world.solver = new CANNON.SplitSolver(solver);
        ige.cannon._slipperyNormalCm.friction = 0.0;*/

		// Define an object to hold references to our player entities
		this.players = {};

        this.levelObjects = {
            goldRocks: []
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

						ige.network.define('playerControlLeftUp', self._onPlayerLeftUp);
						ige.network.define('playerControlRightUp', self._onPlayerRightUp);
						ige.network.define('playerControlForwardsUp', self._onPlayerForwardsUp);
                        ige.network.define('playerControlBackwardsUp', self._onPlayerBackwardsUp);
                        ige.network.define('playerControlJumpUp', self._onPlayerJumpUp);
                        ige.network.define('playerControlBlockUp', self._onPlayerBlockUp);
                        ige.network.define('playerControlChargeLeapUp', self._onPlayerChargeLeapUp);
                        ige.network.define('playerControlAttackDown', self._onPlayerAttackDown);

                        ige.network.define('playerControlRotation', self._onPlayerRotation);

                        ige.network.define('playerUpdateHealth');
                        ige.network.define('playersTakeHit');
                        ige.network.define('playerHarvest');
                        ige.network.define('playerAttributeUpdate');

						ige.network.on('connect', self._onPlayerConnect); // Defined in ./gameClasses/ServerNetworkEvents.js
						ige.network.on('disconnect', self._onPlayerDisconnect); // Defined in ./gameClasses/ServerNetworkEvents.js

						// Add the network stream component
						ige.network.addComponent(IgeStreamComponent)
							.stream.sendInterval(20) // Send a stream update once every 30 milliseconds
							.stream.start(); // Start the stream

						// Accept incoming network connections
						ige.network.acceptConnections(true);

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1');

                        self.scene1._threeObj = new Physijs.Scene({ fixedTimeStep: 1 / 120 });
                        self.scene1._threeObj.setGravity(new THREE.Vector3(0, -30, 0));
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
    physibehaviour: function (ctx) {
        ige.server.scene1._threeObj.simulate(); //1 / 60     0.001 * ige._tickDelta
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Server; }