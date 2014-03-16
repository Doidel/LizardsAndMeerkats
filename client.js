var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
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
            charge: new IgeTexture('./assets/textures/charge.png'),
            healthbarInner: new IgeTexture('assets/ui/healthbarInner.png'),
            healthbarRed: new IgeTexture('assets/ui/healthbarRed.png'),
            healthbarOuter: new IgeTexture('assets/ui/healthbarOuter.png')
		};

        //this.armBones1 = ["Shoulder_L", "Arm_L", "ArmLower_L", "Hand_L", "Shoulder_R", "Arm_R", "ArmLower_R", "Hand_R", "Back", "NeckLower", "NeckUpper", "Head"];
        this.armBones2 = ["Shoulder_L", "Arm_L", "ArmLower_L", "Hand_L", "Shoulder_R", "Arm_R", "ArmLower_R", "Hand_R", "Back", "NeckLower", "NeckUpper", "Head", "BackRoot", "BackRoot1", "BackRoot2", "BackRoot3"];
        //this.legBones1 = ["Root", "Hip_L", "LegUpper_L", "LegLower_L", "Foot_L", "Hip_R", "LegUpper_R", "LegLower_R", "Foot_R", "BackRoot", "BackRoot1", "BackRoot2", "BackRoot3"];
        this.legBones2 = ["Root", "Hip_L", "LegUpper_L", "LegLower_L", "Foot_L", "Hip_R", "LegUpper_R", "LegLower_R", "Foot_R"];


        this.controls =  {
            enabled: false
        };

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
                        ige.network.define('setStreamBuildingBuildable', self._onSetStreamedBuildingBuildable);

						// Setup the network stream handler
						ige.network.addComponent(IgeStreamComponent)
							.stream.renderLatency(40) // Render the simulation 160 milliseconds in the past
							// Create a listener that will fire whenever an entity
							// is created because of the incoming stream data
							.stream.on('entityCreated', function (entity) {
								self.log('Stream entity created with ID: ' + entity.id());
							});

						// Create the scene
						self.scene1 = new StreamScene()
                            .shouldRender(false)
							.id('scene1');

                        self.scene1._threeObj.name = "scene1";

						// Create the main viewport and set the scene
						// it will "look" at as the new scene1 we just
						// created above
						self.vp1 = new IgeViewport()
							.id('vp1')
							.autoSize(true)
							.mount(ige);

                        UI.igeLoadedFunctions();

                        /*self.vp1.camera._threeObj.near = 1;
                        self.vp1.camera._threeObj.far = 1000;
                        console.log(self.vp1.camera._threeObj.near, self.vp1.camera._threeObj.far);*/

						self.vp1.camera.translateTo(0, 2, 2);
                        //self.vp1.camera._threeObj.rotation.order = "YXZ";

                        self.initAudio();
						var backgroundSoundInit = function() {
                            var sound = self.playSound('forestNoise.ogg', true);
                            if (!sound) {
                                setTimeout(backgroundSoundInit, 200);
                            } else {
                                //self._setVolume(sound, 0.1);
                            }
                        };
                        backgroundSoundInit();

                        //remove ambient light
                        self.scene1._threeObj.remove(self.scene1._threeObj.children[0]);

                        console.log('create Sunlight');
                        var sunlight = new THREE.DirectionalLight(0xFFFFFF, 1);
                        sunlight.position.set( 0, 50, 0 );
                        sunlight.shadowDarkness = 0.5;
                        sunlight.castShadow = true;

                        sunlight.shadowMapWidth = 2048;
                        sunlight.shadowMapHeight = 2048;
                        sunlight.shadowMapDarkness = 0.95;
                        //sunlight.shadowCameraVisible = true;
                        sunlight.shadowCameraNear = 85;
                        sunlight.shadowCameraFar = 115;

                        var d = 20;
                        sunlight.shadowCameraLeft = -d;
                        sunlight.shadowCameraRight = d;
                        sunlight.shadowCameraTop = d;
                        sunlight.shadowCameraBottom = -d;

                        sunlight.shadowBias = 0.000065;

                        self._shadowLight = sunlight;

                        self.scene1._threeObj.add(sunlight);

                        ige.addBehaviour('shadowLight', self._shadowLightMovement, true);


                        /*ige._threeRenderer.gammaInput = true;
                        ige._threeRenderer.gammaOutput = true;
                        ige._threeRenderer.shadowMapEnabled = true;

                        ige._threeRenderer.shadowMapCascade = true;
                        ige._threeRenderer.shadowMapType = THREE.PCFSoftShadowMap;
                        ige._threeRenderer.shadowMapEnabled = true;
                        ige._threeRenderer.shadowMapSoft = true;*/

                        /*ige._threeRenderer.shadowCameraNear = 3;
                        ige._threeRenderer.shadowCameraFar = 50;
                        ige._threeRenderer.shadowCameraFov = 50;

                        ige._threeRenderer.shadowMapBias = 0.0039;
                        ige._threeRenderer.shadowMapDarkness = 0.5;
                        ige._threeRenderer.shadowMapWidth = 2048;
                        ige._threeRenderer.shadowMapHeight = 2048;*/
                        ige._threeRenderer.shadowMapEnabled = true;
                        ige._threeRenderer.shadowMapType = THREE.PCFSoftShadowMap;


                        //Instantiate Level and World

                        // World details
                        ige.gameWorld = {
                            //level: self.level1()
                            level: new Level2()
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
                        ige.input.mapAction('build', ige.input.key.b);
                        ige.input.mapAction('key1', ige.input.key[1]);
                        ige.input.mapAction('key2', ige.input.key[2]);
                        ige.input.mapAction('key3', ige.input.key[3]);
                        ige.input.mapAction('key4', ige.input.key[4]);
                        ige.input.mapAction('key5', ige.input.key[5]);
                        ige.input.mapAction('key6', ige.input.key[6]);
                        ige.input.mapAction('key7', ige.input.key[7]);
                        ige.input.mapAction('key8', ige.input.key[8]);
                        ige.input.mapAction('key9', ige.input.key[9]);
                        ige.input.mapAction('key0', ige.input.key[0]);
                        ige.input.mapAction('voice', ige.input.key.v);
                        ige.input.mapAction('donateGold', ige.input.key.g);
                        /*ige.input.mapAction('block', ige.input.mouse.wheel);
                        ige.input.mapAction('chargeLeap', ige.input.mouse.down);*/


                        $(document.body).keyup(function(event) {
                            if (event.which == ige.input.key.enter) {
                                UI.chat.toggleFocus();
                            }
                        });

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
					});

                    //custom animation update
                    THREE.Animation.prototype.rangeUpdate = function(deltaTimeMS, startKey, endKey, layer, repeat, updatableBones) {

                        // vars
                        //var types = ["pos", "rot", "scl"];
                        var types = ["pos", "rot"]; // we just need pos and rot, we don't scale bones
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

                                //for (var t = 0; t < 3; t++) {
                                for (var t = 0; t < types.length; t++) {

                                    // get keys
                                    type = types[ t ];

                                    var flag = false;

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
                                            prevKey = this.data.hierarchy[ h ].keys[ 0 ];
                                            nextKey = this.getNextKeyWith(type, h, 1);

                                            while (nextKey.time < currentTime) {

                                                prevKey = nextKey;
                                                nextKey = this.getNextKeyWith(type, h, nextKey.index + 1);
                                            }
                                        }

                                        animationCache.prevKey[ type ] = prevKey;
                                        animationCache.nextKey[ type ] = nextKey;

                                    }

                                    object.matrixAutoUpdate = true;
                                    object.matrixWorldNeedsUpdate = true;

                                    scale = (currentTime - prevKey.time) / (nextKey.time - prevKey.time);
                                    prevXYZ = prevKey[ type ];
                                    nextXYZ = nextKey[ type ];


                                    // check scale error

                                    if (scale < 0 || scale > 1) {
                                        console.log(currentTime, nextKey.time, prevKey.time);
                                        console.warn("THREE.Animation.update: Warning! Scale out of bounds:" + scale + " on bone " + h);
                                        scale = scale < 0 ? 0 : 1;
                                        //debugger;
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
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

        if ( havePointerLock ) {

            var element = document.body;

            document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

            var pointerlockchange = function ( event ) {

                if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

                    ige.client.controls.enabled = true;

                    ige.client.vp1.emit('pointerLockEntered');

                } else {

                    ige.client.controls.enabled = false;

                    ige.client.vp1.emit('pointerLockLeft');

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


            this.requestPointerLock = function () {

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

            };

            instructions.addEventListener( 'click', this.requestPointerLock, false );

        } else {

            instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

        }
    },
	startVote: function(type) {
		ige.network.send('playerStartVote', {type: type});
	},
    initAudio: function() {
        /**** AUDIO ****/

        var soundUrls = ['lizards1.mp3', 'lizards2.mp3', 'lizards3.mp3', 'lizards4.mp3', 'lizards5.mp3', 'lizards6.mp3', 'meerkats1.mp3', 'meerkats2.mp3', 'meerkats3.mp3', 'meerkats4.mp3', 'meerkats5.mp3', 'meerkats6.mp3', 'forestNoise.ogg'];
        this._sound = {
            pannerList: [],
            bufferList: []
        };

        // create WebAudio API context
        var AudioContext= window.AudioContext || window.webkitAudioContext;
        this._sound.context	= new AudioContext();

        // put a ListenerObject3DUpdater
        this._sound._listenerUpdater = new WebAudiox.ListenerObject3DUpdater(this._sound.context, ige.client.vp1.camera._threeObj);

        // Create lineOut
        this._sound.lineOut	= new WebAudiox.LineOut(this._sound.context);
        this._sound.lineOut.volume	= 1;

        //global load buffer to initialize the sound list
        WebAudiox.loadBuffer.onLoad = function(context, url, buffer){
            ige.client._sound.bufferList.push([url.replace('sounds/',''), buffer]);
        };

        for (var x = 0; x < soundUrls.length; x++) {
            WebAudiox.loadBuffer(this._sound.context, 'sounds/'+soundUrls[x]);
        }

        ige.addBehaviour('soundUpdate', this.soundbehaviour);
    },
    soundbehaviour: function() {
        var self = ige.client;
        var now = Date.now();
        var delta = now - self._lastSoundUpdate;

        self._sound._listenerUpdater.update(delta, now);

        for (var x = 0; x < self._sound.pannerList.length; x++) {
            self._sound.pannerList[x].update(delta, now);
        }

        self._lastSoundUpdate = Date.now();
    },
    addAudioPannerToMesh: function(object3d) {
        console.log('object3d', object3d);
        var self = ige.client;
        var panner	= self._sound.context.createPanner();
        // panner.coneOuterGain	= 0.1
        // panner.coneOuterAngle	= Math.PI *180/Math.PI
        // panner.coneInnerAngle	= 0 *180/Math.PI
        panner.connect(self._sound.lineOut.destination);

        var pannerUpdater	= new WebAudiox.PannerObject3DUpdater(panner, object3d);
        self._sound.pannerList.push(pannerUpdater);
        object3d._panner = panner;
    },
    playAttachedSound: function(url, object3d) {
        var index = this._findSoundIndex(url);
        var panner = object3d._panner;
        if (!panner) {
            this.addAudioPannerToMesh(object3d);
            panner = object3d._panner;
        }
        if (index != -1 && panner) {
            // init AudioBufferSourceNode
            var source	= this._sound.context.createBufferSource();
            source.buffer = this._sound.bufferList[index][1];
            source.loop	= false;
            source.connect(panner);

            // start the sound now
            source.start(0);
        } else {
            console.log('can\'t play sound ' + url, index, panner);
        }
    },
	playSound: function(url, loop) {
		var index = this._findSoundIndex(url);
        if (index != -1) {
            // init AudioBufferSourceNode
            var source	= this._sound.context.createBufferSource();
            source.buffer = this._sound.bufferList[index][1];
            source.loop	= loop;
            source.connect(this._sound.lineOut.destination);

            // start the sound now
            source.start(0);
			
			return source;
        }
		return false;
	},
    _findSoundIndex: function(url) {
        var index = -1;
        for (var x = 0; x < this._sound.bufferList.length; x++) {
            if (this._sound.bufferList[x][0] == url) {
                index = x;
                break;
            }
        }
        return index;
    },
    _shadowLightMovement: function() {
        if (ige.client._sunlightReferencePoint) {
            var p2 = new THREE.Vector3(0,45,0).applyMatrix4(ige.client._sunlightReferencePoint.matrixWorld);
            ige.client._shadowLight.position.set(p2.x + 20, p2.y + 50, p2.z);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }