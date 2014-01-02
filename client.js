var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		ige.showStats(1);
        ige.setFps(60);

		// Setup three.js interaction
		ige.renderContext('three');
		ige.addComponent(IgeThree);
        //ige.addComponent(IgeCannonComponent);

		// Load our textures
		var self = this;

		// Enable networking
		ige.addComponent(IgeNetIoComponent);

		// Implement our game methods
		this.implement(ClientNetworkEvents);

		// Load the textures we want to use
		this.textures = {
			//ship: new IgeTexture('./assets/PlayerTexture.js')
            grass1: new IgeTexture('./assets/textures/grass1.jpg'),
            charge: new IgeTexture('./assets/textures/charge.png')
		};

        this.armBones = ["Shoulder_L", "Arm_L", "ArmLower_L", "Hand_L", "Shoulder_R", "Arm_R", "ArmLower_R", "Hand_R", "Back", "NeckLower", "NeckUpper", "Head"];
        this.legBones = ["Root", "Hip_L", "LegUpper_L", "LegLower_L", "Foot_L", "Hip_R", "LegUpper_R", "LegLower_R", "Foot_R", "BackRoot", "BackRoot1", "BackRoot2", "BackRoot3"];


        ige.on('texturesLoaded', function () {
			// Create the HTML canvas
			ige.createFrontBuffer(true);

			// Setup the input system to use events
			// from the three.js renderer canvas
			ige.input.setupListeners(ige.three._canvas);

			// Ask the engine to start
			ige.start(function (success) {
				// Check if the engine started successfully
				if (success) {
					// Start the networking (you can do this elsewhere if it
					// makes sense to connect to the server later on rather
					// than before the scene etc are created... maybe you want
					// a splash screen or a menu first? Then connect after you've
					// got a username or something?
					ige.network.start('http://localhost:2000', function () {
						// Setup the network command listeners
						ige.network.define('playerEntity', self._onPlayerEntity); // Defined in ./gameClasses/ClientNetworkEvents.js
                        ige.network.define('playersTakeHit', self._onPlayersTakeHit);
                        ige.network.define('playerHarvest', self._onPlayerHarvest);
                        ige.network.define('playerAttributeUpdate', self._onPlayerAttributeUpdate);
                        ige.network.define('playerUpdateHealth', self._onPlayerUpdateHealth);

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(60) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());
							});

						// Create the scene
						self.scene1 = new IgeScene2d()
							.id('scene1');

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.scene(self.scene1)
							.mount(ige);

                        /*self.vp1.camera._threeObj.near = 1;
                        self.vp1.camera._threeObj.far = 1000;
                        console.log(self.vp1.camera._threeObj.near, self.vp1.camera._threeObj.far);*/

						self.vp1.camera.translateTo(0, 2, 2);
                        self.vp1.camera._threeObj.eulerOrder = "YXZ";

                        ige._threeRenderer.shadowMapEnabled = true;
                        ige._threeRenderer.shadowMapSoft = true;

                        self.scene1._threeObj.remove(self.scene1._threeObj._defaultLight);

                        var sunlight = new THREE.DirectionalLight();
                        sunlight.intensity = 0.5;
                        sunlight.position.set(100, 300, 100);
                        sunlight.castShadow = true;
                        //sunlight.shadowBias = -0.0001;
                        sunlight.shadowMapWidth = 1024;
                        sunlight.shadowMapHeight = 1024;
                        sunlight.shadowMapDarkness = 0.95;

                        var d = 250;
                        sunlight.shadowCameraLeft = -d;
                        sunlight.shadowCameraRight = d;
                        sunlight.shadowCameraTop = d;
                        sunlight.shadowCameraBottom = -d;
                        sunlight.shadowCameraNear = 200;
                        sunlight.shadowCameraFar = 800;

                        sunlight.shadowDarkness = 0.6;
                        sunlight.shadowBias = 0.000065;

                        /*sunlight.shadowCascade = true;
                        sunlight.shadowCascadeCount = 3;
                        sunlight.shadowCascadeNearZ = [ -1.000, 0.995, 0.998 ];
                        sunlight.shadowCascadeFarZ  = [  0.995, 0.998, 1.000 ];
                        sunlight.shadowCascadeWidth = [ 1024, 1024, 1024 ];
                        sunlight.shadowCascadeHeight = [ 1024, 1024, 1024 ];*/

                        sunlight.shadowCascadeOffset.set( 0, 0, -10 );

                        self.scene1._threeObj.add( sunlight );
                        sunlight.lookAt(new THREE.Vector3(0,0,0));

                        self.scene1._threeObj._defaultLight = sunlight;



                        ige._threeRenderer.gammaInput = true;
                        ige._threeRenderer.gammaOutput = true;
                        ige._threeRenderer.shadowMapEnabled = true;

                        ige._threeRenderer.shadowMapCascade = true;
                        ige._threeRenderer.shadowMapType = THREE.PCFSoftShadowMap;



                        //Instantiate Level and World

                        self.implement(Levels);

                        // World details
                        ige.gameWorld = {
                            //level: self.level1()
                            level: self.level2(sunlight)
                        };


                        // Add boxes
                        /*var halfExtents = new THREE.Vector3(3,3,3);
                        var boxGeometry = new THREE.CubeGeometry(halfExtents.x*2,halfExtents.y*2,halfExtents.z*2);
                        var material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );
                        for(var i=0; i<7; i++){
                            var x = (Math.random()-0.5)*20;
                            var y = 1 + (Math.random())*40;
                            var z = (Math.random()-0.5)*20;
                            var boxMesh = new THREE.Mesh( boxGeometry, material );
                            self.scene1._threeObj.add(boxMesh);
                            boxMesh.position.set(x,y,z);
                            boxMesh.castShadow = true;
                            boxMesh.receiveShadow = true;
                            boxMesh.useQuaternion = true;
                        }*/




						// Define our player controls
						ige.input.mapAction('left', ige.input.key.a);
						ige.input.mapAction('right', ige.input.key.d);
						ige.input.mapAction('forwards', ige.input.key.w);
                        ige.input.mapAction('backwards', ige.input.key.s);
                        ige.input.mapAction('jump', ige.input.key.space);
                        /*ige.input.mapAction('block', ige.input.mouse.wheel);
                        ige.input.mapAction('chargeLeap', ige.input.mouse.down);*/

                        //mouse events in Player.js

						// Ask the server to create an entity for us
						ige.network.send('playerEntity');

						// We don't create any entities here because in this example the entities
						// are created server-side and then streamed to the clients. If an entity
						// is streamed to a client and the client doesn't have the entity in
						// memory, the entity is automatically created. Woohoo!



                        // Skybox
                        var path = "assets/skybox/";
                        var format = '.jpg';
                        var urls = [
                            path + 'xpos' + format, path + 'xneg' + format,
                            path + 'ypos' + format, path + 'yneg' + format,
                            path + 'zpos' + format, path + 'zneg' + format
                        ];

                        var cubeTexture = THREE.ImageUtils.loadTextureCube(urls);
                        cubeTexture.format = THREE.RGBFormat;

                        var shader = THREE.ShaderLib["cube"];
                        shader.uniforms["tCube"].value = cubeTexture;

                        var skyboxMaterial = new THREE.ShaderMaterial({
                            uniforms: shader.uniforms,
                            fragmentShader: shader.fragmentShader,
                            vertexShader: shader.vertexShader,
                            depthWrite: false,
                            side: THREE.BackSide
                        });

                        var skyboxGeom = new THREE.CubeGeometry(10000, 10000, 10000);
                        var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
                        skybox.flipSided = true;

                        self.scene1._threeObj.add(skybox);



                        //// EMITTER STUFF

                        /*var group = new THREE.Object3D();

                        var sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(200));


                        var emitterpos = new THREE.Vector3(0,0,0);
                        var sphereCap = new SPARKS.SphereCapZone(0, 0, 0, 10, 0, 40);

                        sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
                        sparksEmitter.addInitializer(new SPARKS.Lifetime(0,4));


                        var h = 0;


                        var callback = function() {

                            var material = new THREE.ParticleCanvasMaterial( {  program: SPARKS.CanvasShadersUtils.circles , blending:THREE.AdditiveBlending } );

                            material.color.setRGB(h, 1, 0.5); //0.7
                            h += 1;
                            if (h>255) h-=254;

                            particle = new THREE.Particle( material );

                            particle.scale.x = particle.scale.y = Math.random() * 2 +1;
                            group.add( particle );

                            return particle;
                        };


                        sparksEmitter.addInitializer(new SPARKS.Target(null, callback));

                        sparksEmitter.addInitializer(new SPARKS.Velocity(sphereCap));
                        sparksEmitter.addAction(new SPARKS.Age());
                        sparksEmitter.addAction(new SPARKS.Accelerate(0.2));
                        sparksEmitter.addAction(new SPARKS.Move());

                        sparksEmitter.addCallback("created", function(p) {
                            var position = p.position;
                            p.target.position = position;
                        });

                        sparksEmitter.addCallback("initialized", function(p) {
                            var position = p.position;
                            p.target.position = position;
                        });

                        sparksEmitter.addCallback("dead", function(particle) {
                            particle.target.visible = false; // is this a work around?
                            group.remove(particle.target);

                        });
                        sparksEmitter.start();*/


                        /*sparksEmitter = new SPARKS.Emitter(new SPARKS.SteadyCounter(200));


                        emitterpos = new THREE.Vector3(0,0,0);
                        var sphereCap = new SPARKS.SphereCapZone(0, 0, 0, 10, 0, 40);

                        sparksEmitter.addInitializer(new SPARKS.Position( new SPARKS.PointZone( emitterpos ) ) );
                        sparksEmitter.addInitializer(new SPARKS.Lifetime(0,4));*/
					});

                    //custom animation update
                    THREE.Animation.prototype.rangeUpdate = function(deltaTimeMS, startKey, endKey, layer, repeat, updatableBones) {

                        // vars
                        var types = ["pos", "rot", "scl"];
                        var type;
                        var scale;
                        var vector;
                        var prevXYZ, nextXYZ;
                        var prevKey, nextKey;
                        var object;
                        var animationCache;
                        var frame;
                        var JIThierarchy = this.data.JIT.hierarchy;
                        var currentTime, unloopedCurrentTime;
                        var currentPoint, forwardPoint, angle;
                        var firstLoop = false;

                        // this.currentTime += deltaTimeMS * this.timeScale;
                        var startTime = startKey * (1.0 / this.data.fps);
                        var endTime = endKey * (1.0 / this.data.fps);

                        /*if (this.currentTime <= 0) {
                         this.currentTime = startTime;
                         firstLoop = true;
                         }*/
                        if (this.currentTime.time[layer] <= 0) {
                            this.currentTime.time[layer] = startTime;
                            firstLoop = true;
                        }

                        // check if repeating
                        //if (!repeat && this.currentTime.time[layer] > endTime) {

                        this.currentTime.time[layer] += deltaTimeMS * this.timeScale;

                        unloopedCurrentTime = this.currentTime.time[layer]; //can be over key range

                        var animationLength = endTime - startTime;

                        //this.currentTime = the time where it should be after the animation step. absolute, not relative.
                        currentTime = this.currentTime.time[layer] = startTime + ((this.currentTime.time[layer] - startTime) % animationLength);

                        if (!repeat && unloopedCurrentTime >= endTime) {
                            return endKey;
                        }

                        frame = parseInt(Math.min(currentTime * this.data.fps, endTime * this.data.fps), 10);
                        // console.log(currentTime);

                        for (var h = 0, hl = this.hierarchy.length; h < hl; h++) {

                            var used = false;
                            var useCount = 0;
                            while (updatableBones && !used && useCount < updatableBones.length) {
                                if (updatableBones[useCount] == this.hierarchy[h].name) {
                                    used = true;
                                }
                                ++useCount;
                            }

                            if (!used) {
                                object = this.hierarchy[ h ];
                                animationCache = object.animationCache;

                                // loop through pos/rot/scl

                                for (var t = 0; t < 3; t++) {

                                    // get keys
                                    type = types[ t ];

                                    if (firstLoop) {
                                        prevKey = this.data.hierarchy[ h ].keys[ 0 ];
                                        nextKey = this.getNextKeyWith(type, h, 1);

                                        while (nextKey.time < currentTime) {

                                            prevKey = nextKey;
                                            nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);

                                        }

                                        animationCache.prevKey[ type ] = prevKey;
                                        animationCache.nextKey[ type ] = nextKey;
                                    } else {
                                        prevKey = animationCache.prevKey[ type ];
                                        nextKey = animationCache.nextKey[ type ];
                                    }
                                    //if (t == 0) console.log('nextKey', nextKey.time);

                                    // switch keys?
                                    // switch when next key isn't enough to display the time delta or when the currentTime was moduled i.e. looped

                                    //if (nextKey.time <= unloopedCurrentTime) {
                                    if (nextKey.time <= unloopedCurrentTime || currentTime < unloopedCurrentTime) {

                                        // did we loop?

                                        if (currentTime < unloopedCurrentTime) {

                                            if (this.loop) {

                                                prevKey = this.data.hierarchy[ h ].keys[ 0 ];
                                                nextKey = this.getNextKeyWith(type, h, 1);

                                                while (nextKey.time < currentTime) {

                                                    prevKey = nextKey;
                                                    nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);

                                                }

                                            } else {

                                                this.stop();
                                                return frame;

                                            }

                                        } else {

                                            //find a next key which is above the unlooped current time
                                            do {

                                                prevKey = nextKey;
                                                nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);

                                            } while (nextKey.time < currentTime)

                                        }

                                        animationCache.prevKey[ type ] = prevKey;
                                        animationCache.nextKey[ type ] = nextKey;
                                        //console.log('prev', prevKey, 'next', nextKey);

                                    }


                                    object.matrixAutoUpdate = true;
                                    object.matrixWorldNeedsUpdate = true;

                                    scale = (currentTime - prevKey.time) / (nextKey.time - prevKey.time);
                                    prevXYZ = prevKey[ type ];
                                    nextXYZ = nextKey[ type ];


                                    // check scale error

                                    if (scale < 0 || scale > 1) {
                                        console.log(currentTime, prevKey.time, nextKey.time);
                                        console.warn("THREE.Animation.update: Warning! Scale out of bounds:" + scale + " on bone " + h);
                                        scale = scale < 0 ? 0 : 1;
                                    }

                                    // interpolate

                                    if (type === "pos") {

                                        vector = object.position;

                                        if (this.interpolationType === THREE.AnimationHandler.LINEAR) {

                                            vector.x = prevXYZ[ 0 ] + (nextXYZ[ 0 ] - prevXYZ[ 0 ]) * scale;
                                            vector.y = prevXYZ[ 1 ] + (nextXYZ[ 1 ] - prevXYZ[ 1 ]) * scale;
                                            vector.z = prevXYZ[ 2 ] + (nextXYZ[ 2 ] - prevXYZ[ 2 ]) * scale;

                                        } else if (this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
                                            this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) {

                                            this.points[ 0 ] = this.getPrevKeyWith("pos", h, prevKey.index - 1)[ "pos" ];
                                            this.points[ 1 ] = prevXYZ;
                                            this.points[ 2 ] = nextXYZ;
                                            this.points[ 3 ] = this.getNextKeyWith("pos", h, nextKey.index + 1)[ "pos" ];

                                            scale = scale * 0.33 + 0.33;

                                            currentPoint = this.interpolateCatmullRom(this.points, scale);

                                            vector.x = currentPoint[ 0 ];
                                            vector.y = currentPoint[ 1 ];
                                            vector.z = currentPoint[ 2 ];

                                            if (this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD) {

                                                forwardPoint = this.interpolateCatmullRom(this.points, scale * 1.01);

                                                this.target.set(forwardPoint[ 0 ], forwardPoint[ 1 ], forwardPoint[ 2 ]);
                                                this.target.sub(vector);
                                                this.target.y = 0;
                                                this.target.normalize();

                                                angle = Math.atan2(this.target.x, this.target.z);
                                                object.rotation.set(0, angle, 0);

                                            }

                                        }

                                    } else if (type === "rot") {

                                        THREE.Quaternion.slerp(prevXYZ, nextXYZ, object.quaternion, scale);

                                    } else if (type === "scl") {

                                        vector = object.scale;

                                        vector.x = prevXYZ[ 0 ] + (nextXYZ[ 0 ] - prevXYZ[ 0 ]) * scale;
                                        vector.y = prevXYZ[ 1 ] + (nextXYZ[ 1 ] - prevXYZ[ 1 ]) * scale;
                                        vector.z = prevXYZ[ 2 ] + (nextXYZ[ 2 ] - prevXYZ[ 2 ]) * scale;

                                    }

                                }

                            }
                        }
                    return frame;

                    };
				}
			});
		});
	},
    instantiatePointerLock: function() {
        var blocker = document.getElementById( 'blocker' );
        var instructions = document.getElementById( 'instructions' );
        ige.client.controls =  {
            enabled: false
        };
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if ( havePointerLock ) {

            var element = document.body;

            var pointerlockchange = function ( event ) {

                if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                    ige.client.controls.enabled = true;

                    blocker.style.display = 'none';

                } else {

                    ige.client.controls.enabled = false;

                    blocker.style.display = '-webkit-box';
                    blocker.style.display = '-moz-box';
                    blocker.style.display = 'box';

                    instructions.style.display = '';

                }

            };

            var pointerlockerror = function ( event ) {
                instructions.style.display = '';
            };

            // Hook pointer lock state change events
            document.addEventListener( 'pointerlockchange', pointerlockchange, false );
            document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
            document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

            document.addEventListener( 'pointerlockerror', pointerlockerror, false );
            document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
            document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

            instructions.addEventListener( 'click', function ( event ) {

                instructions.style.display = 'none';

                // Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

                if ( /Firefox/i.test( navigator.userAgent ) ) {

                    var fullscreenchange = function ( event ) {

                        if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

                            document.removeEventListener( 'fullscreenchange', fullscreenchange );
                            document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

                            element.requestPointerLock();
                        }

                    }

                    document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                    document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                    element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

                    element.requestFullscreen();

                } else {

                    element.requestPointerLock();

                }

            }, false );

        } else {

            instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }