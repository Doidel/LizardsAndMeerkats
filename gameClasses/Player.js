var Player = IgeEntity.extend({
    classId: 'Player',

    //Ask SavXR Natsu for balances

    init: function (id) {
        IgeEntity.prototype.init.call(this);

        var self = this;

        if (!ige.isServer && typeof(id) == 'object') {
            var createData = id;
            id = id.id;
            this.faction = createData.faction;
        }

        if (id) {
            this.id(id);
        }


        this.states = {
            canJump: true,
            rockLastHarvested: ige._currentTime,
            isDead: false,
            isSpawned: false,
            isJumping: false,
            currentBlockFrame: 200,
            isScratching: false,
            isAttacking: false,
            attackType: 0, //0-2
            nextPossibleAttack: 0,
            standingStage: 0,
            standingControlTime: 0,
            nextStandingAnim: 0,
            isDying: false,
            noAnimation: false,
            isCharging: false,
            isBuilding: false,
            isRunning: false,
            isUsingVoice: false,
            runDirection: 0,
            oldRunDir: -1
        };

        this.controls = {
            left: false,
            right: false,
            forwards: false,
            backwards: false,
            jump: false,
            block: false,
            chargeLeap: false,
            attack: false,
            rotation: 0,
            key0: false,
            key1: false,
            key2: false,
            key3: false,
            key4: false,
            key5: false,
            key6: false,
            key7: false,
            key8: false,
            key9: false,
            build: false,
            voice: false
        };

        this.values = {
            name: 'player' + this.id(),
            currentStamina: 100,
            maxStamina: 100,
            staminaregeneration: 0.01,
            health: 300,
            maxhealth: 300,
            healthregeneration: 0.005,
            gold: 0,
            woodOrStone: 0
        };

        //contains data and actions which have to be streamed to the client, e.g.
        //_streamActions['uH'] =  299 // identifier = 'updateHealth', value = 299
        this._streamActions = {};

        // Define the data sections that will be included in the stream
        this._streamActionSections = ['playVoiceCommand', 'playersTakeHit', 'playerHarvest', 'updateHealth', 'playerAttributeUpdate', 'playerSpawn', 'playerSetComponent', 'playerSetControlLeft', 'syncGold'];
        this.streamSections(['transform', 'runDirection'].concat(this._streamActionSections));

        if (!ige.isServer) {

            console.log('set model...');
            this._setPlayerModel();

            //Colors etc
            this.visuals = {
                hitColor: new THREE.Color()
            };
            this.visuals.hitColor.setRGB(3,0,0);
            this._materialAmbientBackup = this._threeObj.material.ambient;

            ige.client.addAudioPannerToMesh(this._threeObj);

            UI.resources.setFactionImages(this.faction);
        }

        if (ige.isServer) {

            //figure out the faction
            if (ige.server.gameStates.playerCounts.lizards == ige.server.gameStates.playerCounts.meerkats) {
                this.faction = Math.random() < 0.5 ? 'meerkats' : 'meerkats';
            } else if (ige.server.gameStates.playerCounts.lizards < ige.server.gameStates.playerCounts.meerkats) {
                this.faction = 'lizards';
            } else {
                this.faction = 'meerkats';
            }
            ige.server.gameStates.playerCounts[this.faction]++;

            var playerMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                0.99, // friction
                0.01 // restitution
            );

            this._threeObj = new Physijs.CapsuleMesh(
                new THREE.CylinderGeometry(0.5, 0.5, 1),
                playerMaterial,
                5 //mass
            );

            // Enable CCD if the object moves more than 0.5 meter in one simulation frame
            this._threeObj.setCcdMotionThreshold(0.5);

            // Set the radius of the embedded sphere such that it is smaller than the object
            this._threeObj.setCcdSweptSphereRadius(0.1);

            this._threeObj.geometry.dynamic = false;
            this.spawn('mainBuilding' + this.faction == 'lizards' ? 'Lizards' : 'Meerkats');

            var upAxis = new THREE.Vector3(0,1,0);
            this._threeObj.addEventListener('collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
                contact_normal.negate();
                if(contact_normal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
                    self.states.canJump = true;
            });
            setTimeout(function() {
                this._threeObj.setAngularFactor({ x: 0, y: 0, z: 0 });
                //this._threeObj.setLinearFactor(new THREE.Vector3(0.0000001,0.9,0.0000001));
            }.bind(this), 2000);
            ige.server.scene1._threeObj.add( this._threeObj );

            //self.addComponent(LevelRoomComponent);
            self.addComponent(IgeLevelRoomComponent, {
                networkLevelRoomCheckInterval: ige.server.gameOptions.networkLevelRoomCheckInterval,
                networkLevelRoomSize: ige.server.gameOptions.networkLevelRoomSize
            });

            setTimeout(function() {
                //this._updateHealth(0, true);
            }.bind(this), 10000);
        }
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
    //streamSectionData: function (sectionId, data) {
    streamSectionData: function (sectionId, data, bypassTimeStream) {
        // Check if the section is one that we are handling
        if(sectionId == 'runDirection'){
            if(!data){
                if(ige.isServer){
                    return this.states.runDirection;
                } else {
                    return;
                }
            } else {
				data = parseInt(data);
				this.states.runDirection = data;
                if (data != 0){
                    //running
                    var direction = 1, start = 10, end = 170;
					switch (data) {
						case 4:
							direction = 2; start = 1030; end = 1190;
							break;
						case 2:
							direction = 3; start = 1220; end = 1380;
							break;
					}
                    this.states.isRunning = [direction, start, end];
                } else {
                    this.states.isRunning = false;
                }
            }
        } else if (this._streamActionSections.indexOf(sectionId) != -1) {
            if (!data) {
                if (ige.isServer) {
                    return this._getJSONStreamActionData(sectionId);
                } else {
                    return;
                }
            }
            var dataArr = JSON.parse(data);
            for (var dataId in dataArr) {
                data = dataArr[dataId];

                //execute section handlers
                if (sectionId == 'playerSetComponent') {
                    if (data.add !== false) {
                        this.addComponent(window[data.component]);
                    } else {
                        this.removeComponent(data.component);
                    }
                } else if (sectionId == 'playerSpawn') {
                    this.faction = data.faction;
                    UI.resources.setFactionImages(this.faction);
                    this.spawn(undefined, data.unit);
                } else if (sectionId == 'playVoiceCommand') {
                    data = parseInt(data);
                    ige.client.playAttachedSound(this.faction + data + '.mp3', p._threeObj);
                } else if (sectionId == 'playersTakeHit') {
                    for (var x = 0; x < data.hit.length; x++) {
                        if (ige.$(data.hit[x])) {
                            ige.$(data.hit[x]).takeDamage(data.dmg);
                        }
                    }
                } else if (sectionId == 'playerHarvest') {
                    data = parseInt(data);
                    if (data > 0) {
                        this.states.isScratching = true;
                        this.values.gold += data;
                        if (this._id == ige._player._id) {
                            UI.notifications.displayHarvest(data);
                            UI.resources.setResource(1, this.values.gold);
                        }
                    } else {
                        this.states.isScratching = false;
                    }
                } else if (sectionId == 'updateHealth') {
                    if (ige.$(data.unit)) {
                        ige.$(data.unit)._updateHealth(data.health);
                    }
                } else if (sectionId == 'playerAttributeUpdate') {
                    var p = ige.$(data.player);
                    p[data.group][data.name] = data.value;
                } else if (sectionId == 'syncGold') {
                    data = parseInt(data);
                    this.values.gold = data;
                    UI.resources.setResource(1, data);
                }
            }
        } else {
            // The section was not one that we handle here, so pass this
            // to the super-class streamSectionData() method - it handles
            // the "transform" section by itself
            //return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
            return IgeEntity.prototype.streamSectionData.call(this, sectionId, data, bypassTimeStream);
        }
    },

    _getJSONStreamActionData: function(property) {
        if (this._streamActions.hasOwnProperty(property) && this._streamActions[property] != undefined) {
            var data = this._streamActions[property];
            delete this._streamActions[property];
            return JSON.stringify(data);
        }
    },

    //called when a player is first created on a client through the stream
    streamCreateData: function() {
        return {
            id: this.id(),
            faction: this.faction
        }
    },

    addStreamData: function(id, data, keepOld) {
        //console.log(keepOld, typeof(this._streamActions[id]));
        if (keepOld === true && typeof(this._streamActions[id]) == 'array') {
            this._streamActions[id].push(data);
        } else {
            this._streamActions[id] = [data];
        }
    },

    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
        var self = this;
        /* CEXCLUDE */
        if (ige.isServer) {
            if (!this.states.isDead && this.states.isSpawned) {
                var inputVelocity = new THREE.Vector3(0,0,0);
                var velocity = new THREE.Vector3(0,0,0);
                var velocityFactor = 0.2;

                if (this.controls.jump && this.states.canJump) {
                    this.states.canJump = false;
                    this.controls.jump = false;
                    velocity.y = 16;
                }


                var delta = ige._tickDelta;

                if ( this.controls.forwards){
                    inputVelocity.z = -velocityFactor * delta;
                } else if ( this.controls.backwards ){
                    inputVelocity.z = velocityFactor * delta;
                }

                if (this.controls.left){
                    inputVelocity.x = -velocityFactor * delta;
                } else if (this.controls.right){
                    inputVelocity.x = velocityFactor * delta;
                }

                //regulate the speed so you can't profit from double speed by going both directions
                if (Math.abs(inputVelocity.x) > 0 && Math.abs(inputVelocity.z) > 0) {
                    inputVelocity.x /= 1.4142;
                    inputVelocity.z /= 1.4142;
                }


                self.rotateBy(0, this.controls.rotation, 0);
                this.controls.rotation = 0;


                var wasCharging = this.states.isCharging;
                this.states.isCharging = false;

                if (this.controls.chargeLeap) {
                    //switch between charge and leap mode
                    if (false && this.states.canJump) {
                        //leap
                        this.states.canJump = false;
                        this.states.isCharging = false;
                        this.controls.chargeLeap = false;
                        this.states.isLeaping = true;
                        velocity.y = 5;
                        setTimeout(function() {
                            self.states.isLeaping = false;
                        }, 200);
                    } else if (true) {
                        //charge
                        if (this.states.canJump) this.states.isCharging = true;
                    }
                }

                //if we can't jump it means we're already in air. If so the previous charge still applies
                if (!this.states.canJump && wasCharging) {
                    //still charging
                    this.states.isCharging = true;
                }

                if (this.states.isLeaping) {

                    /*var quatLeap = new THREE.Quaternion();
                     quatLeap.setFromEuler({x:self._rotate.x, y:self._rotate.y, z:0},"XYZ");
                     impulse.applyQuaternion(quatLeap);*/
                    inputVelocity.x *= 5;
                    inputVelocity.z *= 5;
                }

                if (this.states.isCharging) {
                    inputVelocity.z *= 2.5;
                    inputVelocity.x *= 2.5;
                }

                // Convert velocity to world coordinates
                var quat = new THREE.Quaternion();
                //deprecated -- quat.setFromEuler({x:self._rotate.x, y:self._rotate.y, z:0},"XYZ");
                quat.setFromEuler(new THREE.Euler( self._rotate.x, self._rotate.y, 0 ));
                inputVelocity.applyQuaternion(quat);

                var currentVelocity = this._threeObj.getLinearVelocity();

                currentVelocity.z = inputVelocity.z;
                currentVelocity.x = inputVelocity.x;
                currentVelocity.y = Math.round(currentVelocity.y * 1000000) / 1000000; //rounding y fluctuation to prevent streaming of very small numbers
                if (velocity.y > 0) currentVelocity.y = velocity.y;

                this._threeObj.setLinearVelocity(currentVelocity);

                // ATTACK
                if (this.controls.attack) {
                    this.controls.attack = false;
                    if (this.states.nextPossibleAttack <= ige._currentTime) this.executeAttack();
                } else if (self.states.isScratching && !this._scratchStopTimeout) {
                    this._scratchStopTimeout = setTimeout(function() {
                        self._sendScratchStop();
                    }, 1000); //duration of one scratch/harvest + 400, so the player can send another harvest after the first was done
                    //can be stopped/cleared in "executeAttack"
                }
            } else {
                this._threeObj.setLinearVelocity(new THREE.Vector3(0,0,0));
            }
        }
        /* CEXCLUDE */

        if (!ige.isServer) {

            //player controls
            if (ige.client.controls.enabled && ige._player._id == this._id) {

                if (ige.input.actionState('left')) {

                    if (!this.controls.left) {
                        // Record the new state
                        this.controls.left = true;

                        // Tell the server about our control change
                        ige.network.send('playerControlLeftDown');
                    }
                } else {
                    if (this.controls.left) {
                        // Record the new state
                        this.controls.left = false;

                        // Tell the server about our control change
                        ige.network.send('playerControlLeftUp');
                    }
                }

                if (ige.input.actionState('right')) {
                    if (!this.controls.right) {
                        // Record the new state
                        this.controls.right = true;

                        // Tell the server about our control change
                        ige.network.send('playerControlRightDown');
                    }
                } else {
                    if (this.controls.right) {
                        // Record the new state
                        this.controls.right = false;

                        // Tell the server about our control change
                        ige.network.send('playerControlRightUp');
                    }
                }

                if (ige.input.actionState('forwards')) {
                    if (!this.controls.forwards) {
                        // Record the new state
                        this.controls.forwards = true;

                        // Tell the server about our control change
                        ige.network.send('playerControlForwardsDown');
                    }
                } else {
                    if (this.controls.forwards) {
                        // Record the new state
                        this.controls.forwards = false;

                        // Tell the server about our control change
                        ige.network.send('playerControlForwardsUp');
                    }
                }

                if (ige.input.actionState('backwards')) {
                    if (!this.controls.backwards) {
                        // Record the new state
                        this.controls.backwards = true;

                        // Tell the server about our control change
                        ige.network.send('playerControlBackwardsDown');
                    }
                } else {
                    if (this.controls.backwards) {
                        // Record the new state
                        this.controls.backwards = false;

                        // Tell the server about our control change
                        ige.network.send('playerControlBackwardsUp');
                    }
                }

                if (ige.input.actionState('jump')) {
                    if (!this.controls.jump) {
                        // Record the new state
                        this.controls.jump = true;
                        this.states.isJumping = true;


                        // Tell the server about our control change
                        ige.network.send('playerControlJumpDown');
                    }
                } else {
                    if (this.controls.jump) {
                        // Record the new state
                        this.controls.jump = false;

                        // Tell the server about our control change
                        ige.network.send('playerControlJumpUp');
                    }
                }

                if (ige.input.actionState('build')) {
                    if (!this.controls.build) {
                        // Record the new state
                        this.controls.build = true;
                    }
                } else {
                    if (this.controls.build) {
                        // Record the new state
                        this.controls.build = false;

                        if(this.commander) this.commander.toggleBuildingMode();
                    }
                }

                if (ige.input.actionState('voice')) {
                    if (!this.controls.voice) {
                        // Record the new state
                        this.controls.voice = true;
                    }
                } else {
                    if (this.controls.voice) {
                        // Record the new state
                        this.controls.voice = false;

                        this.toggleVoiceMode();
                    }
                }

                if (ige.input.actionState('donateGold')) {
                    if (!this.controls.donateGold) {
                        // Record the new state
                        this.controls.donateGold = true;
                        UI.resources.setKeyPressed('key_G', true);
                        this._goldDonationVal = 0;
                    }
                } else {
                    if (this.controls.donateGold) {
                        // Record the new state
                        this.controls.donateGold = false;
                        UI.resources.setKeyPressed('key_G', false);
                        var donationAmount = Math.round(this.values.gold / 100 * this._goldDonationVal);
                        UI.resources.makeDonation(donationAmount);
                        ige.network.send('playerDonateGold', donationAmount);
                    }
                }

                if (this.controls.donateGold) {
                    this._goldDonationVal = Math.min(this._goldDonationVal + 0.05 * ige._tickDelta, 100);
                    UI.resources.setGoldDonationPercentage(this._goldDonationVal, Math.round(this.values.gold / 100 * this._goldDonationVal));
                }

                for(var i=0; i<10; ++i){
                    if (ige.input.actionState('key' + i)) {
                        if (!this.controls['key' + i]) {
                            // Record the new state
                            this.controls['key' + i] = true;

                            // Tell the server about our control change
                            if (!this.states.isUsingVoice) {
                                ige.network.send('playerControlNumKeyDown', i);
                                this._numKeyChanged(i, false);
                            }
                        }
                    } else {
                        if (this.controls['key' + i]) {
                            // Record the new state
                            this.controls['key' + i] = false;

                            // Tell the server about our control change
                            if (!this.states.isUsingVoice) {
                                ige.network.send('playerControlNumKeyUp', i);
                                this._numKeyChanged(i, true);
                            } else {
                                ige.network.send('playerPlayVoiceCommand', i);
                                this.toggleVoiceMode();
                            }
                        }
                    }
                }
            }

            if (!this.states.noAnimation) {
            //if (false) {
                //legs animation
                if (this.states.isDying) {
                    this._checkResetAnimation('dying', 0);
                    //this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 770, 810, 0, false, ige.client.armBones);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 770, 810, 0, false, ige.client.armBones2);
                } else if (this.states.isJumping) {
                    this._checkResetAnimation('jumping', 0);
                    //var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 300, 410, 0, false, ige.client.armBones);
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 300, 410, 0, false, ige.client.armBones2);
                    if (frame >= 400) this.states.isJumping = false;
                } else if (this.states.isRunning != false) {
                    this._checkResetAnimation('running' + this.states.isRunning[0], 0);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, this.states.isRunning[1], this.states.isRunning[2], 0, true, ige.client.armBones2);
                    //this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, start, end, 0, true, ige.client.armBones2);
                } else {
                    //if (this._previousAnimation[0].indexOf('standing') == -1) this.states.nextStandingAnim = 0;
                    var start = 840, end = 880;
                    var repeat = true;
                    var speed = 0.5;
                    if (this.states.standingStage == 1) {
                     start = 880; end = 920;
                     speed = 1.5;
                     repeat = false;
                     } else if (this.states.standingStage == 2) {
                     start = 920; end = 960;
                     speed = 1.5;
                     repeat = false;
                     } else if (this.states.standingStage == 3) {
                     start = 960; end = 1000;
                     speed = 1.5;
                     repeat = false;
                     }
                    //this._checkResetAnimation('standing' + this.states.standingStage, 0);
                    this._checkResetAnimation('standing' + 0, 0);
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speed, start, end, 0, repeat, ige.client.armBones2);
                    //var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speed, start, end, 0, repeat, ige.client.armBones1);

                    var standingControlTimeMin = 1000 * 5;
                    if(this.states.standingControlTime > standingControlTimeMin && this.states.standingStage == 0){
                        this.states.standingStage = parseInt(Math.random()*4);
                        //this.states.standingStage = parseInt(Math.random()*1);
                    }

                    //if (frame >= end) this.states.standingStage = (this.states.standingStage + 1) % 4;
                    //if (this.states.standingStage > 0) {
                    if(frame >= end){
                        this.states.standingStage = 0;
                        this.states.standingControlTime = 0;
                    }
                    /*} else {
                     this.states.standingControlTime += ige._tickDelta / 1;
                     }*/
                    //}
                }

                //arms animation
                if (this.states.isDying) {
                    this._checkResetAnimation('dying', 1);
                    var start = 760, end = 800, speedUp = 0.5;
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speedUp, start, end, 1, false, ige.client.legBones2);
                    if (frame >= end) {
                        this.states.isDying = false;
                        if (this.states.isDead) this.states.noAnimation = true;
                    }
                } else if (this.states.isAttacking) {
                    var start = 440, end = 490, direction = 1, speedUp = 1.4, type=0;
                    //var start = 620, end = 690, direction = 0, add = 0, speedUp = 0.5, type=0;
                    //var start = 1410, end = 1510, speedUp = 2.4;
                    if (this.states.attackType == 1) {
                        start = 520; end = 590; speedUp = 1.8;
                    } else if (this.states.attackType == 2) {
                        start = 620; end = 690; speedUp = 1.2;
                    }

                    //hit-left: 1410 - 1460, 1490 - 1560, 1590 - 1660
                    //hit-right: 1690 - 1740, 1770 - 1840, 1870 - 1940

                    if (this.states.runDirection == 4) {
                        //start = 1870, end = 1940, direction = 2;
                        add = 1250, direction = 2;
                        start += add, end += add;
                    } else if (this.states.runDirection == 2) {
                        //start = 1590, end = 1660, direction = 1;
                        add = 970, direction = 1;
                        start += add, end += add;
                    }

                    //this._checkResetAnimation('attack' + this.states.attackType + direction, 1);
                    this._checkResetAnimation('attack' + this.states.attackType, 1);
                    if(this.states.oldRunDir == -1 || this.states.oldRunDir == direction){
                    //var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speedUp, start, end, 1, false, ige.client.legBones);
                    //var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speedUp, start + add, end + add, 1, false, ige.client.legBones2);
                        var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speedUp, start, end, 1, false, ige.client.legBones2);
                        this.states.oldRunDir = direction;
                    } else {
                        this.states.isAttacking = false;
                        this.states.oldRunDir = -1;
                    }

                    if (frame >= end) {
                        // increment attackType
                        if(this.states.attackType > 1){
                            this.states.attackType = 0;
                        } else {
                            ++this.states.attackType;
                        }
                        this.states.isAttacking = false;
                        this.states.oldRunDir = -1;
                    }
                } else if (this.controls.block) {
                    //start block - left: 1970 - 2000
                    //block - left: 2000 - 2010
                    //end block - left: 2010 - 2040
                    //start block - right: 2070 - 2100
                    //block - right: 2100 - 2110
                    //end block - right: 2110 - 2140


                    var start = 200, end = 230, add = 0, direction = 0;

					if (this.states.runDirection == 4) {
                        add = 1870, direction = 2;
                        start += add, end += add;
                    } else if (this.states.runDirection == 2) {
                        add = 1770, direction = 1;
                        start += add, end += add;
                    }

                    if(this.states.oldRunDir != direction){
                        this.states.currentBlockFrame = 230 + add;
                    }

                    //if he's raising the block, start the raising animation. If not, do no animation.
                    if (this.states.currentBlockFrame < 230 + add) {
                        console.log(this.states.currentBlockFrame, 230 + add);
                        if (this.states.currentBlockFrame == 200) this._checkResetAnimation('block1' + direction, 1);
                        this.states.currentBlockFrame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, start, end + 10, 1, false, ige.client.legBones2);
                    } else {
                        this._checkResetAnimation('block1' + direction, 1);
                        this.states.currentBlockFrame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, end, end + 10, 1, true, ige.client.legBones2);
                    }

                    this.states.oldRunDir = direction;

                } else if (this.states.currentBlockFrame > 200) {

                    var start = 240, end = 270, add = 0, direction = 0;

                    if (this.states.runDirection == 4) {
                        add = 1870, direction = 2;
                        start += add, end += add;
                    } else if (this.states.runDirection == 2) {
                        add = 1770, direction = 1;
                        start += add, end += add;
                    }

                    if(this.states.oldRunDir != direction){
                        if (this.states.oldRunDir >= 1970 && this.states.oldRunDir <= 2000){
                            this.states.currentBlockFrame -= 1770;
                        } else if (this.states.oldRunDir >= 2070 && this.states.oldRunDir <= 2100){
                            this.states.currentBlockFrame -= 1870;
                        }
                        this.states.currentBlockFrame += add;
                    }
                    this.states.oldRunDir = direction;

                    if (this.states.currentBlockFrame < 240 + add) this._checkResetAnimation('block2', 1);
                    //lower-block animation
                    console.log(start, end);
                    this.states.currentBlockFrame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, start, end, 1, false, ige.client.legBones2);
                    if (this.states.currentBlockFrame >= 270 + add) {
                        //reset animation
                        this.states.currentBlockFrame = 200;
                        this._checkResetAnimation('block2', 1);
                    }
                } else if (this.states.isScratching) {
                    this._checkResetAnimation('scratching', 1);
                    //this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 / 2, 720, 740, 1, true, ige.client.legBones);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 / 2, 720, 740, 1, true, ige.client.legBones2);
                } else if (this.states.isJumping) {
                    this._checkResetAnimation('jumping', 1);
                    //this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 300, 410, 1, false, ige.client.legBones);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 300, 410, 1, false, ige.client.legBones2);
                } else if (this.states.isRunning != false) {
                    //running
                    //if(this.states.isRunning){
                    this._checkResetAnimation('running' + this.states.isRunning[0], 1);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, this.states.isRunning[1], this.states.isRunning[2], 1, true, ige.client.legBones2);
                    //}
                } else {
                    //standing
                    this._checkResetAnimation('standing' + this.states.standingStage, 1);
                    //if (this.states.nextStandingAnim <= ige._currentTime) {
                    var start = 840, end = 880;
                    var speed = 0.5;
                    var repeat = true;
                    if (this.states.standingStage == 1) {
                        start = 880; end = 920;
                        speed = 1.5;
                        repeat = false;
                    } else if (this.states.standingStage == 2) {
                        start = 920; end = 960;
                        speed = 1.5;
                        repeat = false;
                    } else if (this.states.standingStage == 3) {
                        start = 960; end = 1000;
                        speed = 1.5;
                        repeat = false;
                    }
                    //var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speed, start, end, 1, repeat, ige.client.legBones1);
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speed, start, end, 1, repeat, ige.client.legBones2);
                    //}

                }
            }

            //run straight ahead: 10 - 170
            //start block: 200 - 230
            //block: 230 - 240
            //end block: 240 - 270
            //jump: 300 - 410
            //hit: 440 - 490, 520 - 590, 620 - 690
            //scratch: 720 - 740
            //death: 770 - 810
            //idle: 840-880, 880-920, 920-960, 960-1000
            //run left: 1030 - 1190
            //run right: 1220 - 1380
            //hit-left: 1410 - 1460, 1490 - 1560, 1590 - 1660
            //hit-right: 1690 - 1740, 1770 - 1840, 1870 - 1940
            //start block - left: 1970 - 2000
            //block - left: 2000 - 2010
            //end block - left: 2010 - 2040
            //start block - right: 2070 - 2100
            //block - right: 2100 - 2110
            //end block - right: 2110 - 2140
        }


        //// STAMINA
        if (!this.states.isDead && (this.values.currentStamina < this.values.maxStamina || this.controls.block)) {
            var diff = (this.values.staminaregeneration*ige._tickDelta);

            if (this.controls.block) {
                this.values.currentStamina = Math.max(this.values.currentStamina - diff*2, 0);
            } else if (this.values.currentStamina < this.values.maxStamina) {
                this.values.currentStamina = Math.min(this.values.currentStamina + diff, this.values.maxStamina);
            }

            if (!ige.isServer) UI.blockBar.setPercent(100 / this.values.maxStamina * this.values.currentStamina);
        }

        //// HEALTH REGEN
        if (this.values.health < this.values.maxhealth && !this.states.isDead) {
            var diff = (this.values.healthregeneration*ige._tickDelta);
            this.values.health = Math.min(this.values.health + diff, this.values.maxhealth);
            this._updateHealth(this.values.health);
        }

        // Call the IgeEntity (super-class) tick() method
        IgeEntity.prototype.tick.call(this, ctx);

        //update entity translations. needed for streaming.
        if (!this.states.isDead && this.states.isSpawned) this.translateTo(this._threeObj.position.x, this._threeObj.position.y, this._threeObj.position.z); // - this._geometry.z2
    },
    /* CEXCLUDE */
    executeAttack: function() {
        var self = this;
        var PI_2 = Math.PI * 2;
        var blockHitAngle = Math.PI * 0.35;
        var rot = (self._rotate.y % PI_2 + PI_2) % PI_2;
        var enemyrot, angle, isBlocked;
        var objectsTakenHit = [];
        var enemyAround = self._isEnemyAround();

        //check for the actual hit 300ms later
        setTimeout(function() {
            self._updateThreeTransform();
            self._threeObj.updateMatrixWorld();
            var possibleEnemies = self.getPlayersWithinRadius(1.4);
            for (var x = 0; x < possibleEnemies.length; x++) {
                if (possibleEnemies[x]._id == self._id) continue;
                isBlocked = false;
                if (possibleEnemies[x].controls.block) {
                    //enemyrot = (possibleEnemies[x]._rotate.y % PI_2 + PI_2 + Math.PI) % PI_2; //+Math.PI because we want the enemy to face you in order to block
                    enemyrot = possibleEnemies[x]._rotate.y + Math.PI;
                    isBlocked = self._angleDistance(enemyrot - rot) < blockHitAngle;
                }

                angle = Math.atan2(
                    possibleEnemies[x]._translate.x - self._translate.x,
                    possibleEnemies[x]._translate.z - self._translate.z
                ) + Math.PI; //Math.atan2 goes from -Math.PI to +Math.PI, we want everything to be positive though

                if (self._angleDistance(angle, rot) < blockHitAngle && !isBlocked) {
                    //hit
                    objectsTakenHit.push(possibleEnemies[x]._id);
                    possibleEnemies[x].takeDamage(40);
                }
            }

            //does he hit a building?
            var buildingsHit = self.getBuildingsHit();
            if (buildingsHit.length > 0) console.log('player hits buildings: ', buildingsHit);
            for (var x = 0; x < buildingsHit.length; x++) {
                console.log('Hit a building!');
                objectsTakenHit.push(buildingsHit[x]._id);
                objectsTakenHit.takeDamage(40);
            }

            if (objectsTakenHit.length > 0) {
                //send the hit to all players
                self.addStreamData('playersTakeHit', {hit: objectsTakenHit, dmg: 20});
            }
        }, 100); //TODO: Deduct the latency from the hit delay?

        var rockFound = false;
        if (!enemyAround) {
            //maybe he's trying to harvest?
            for (var r = 0; r < ige.server.levelObjects.goldRocks.length; r++) {
                //is he near a gold rock?
                var rock = ige.server.levelObjects.goldRocks[r];
                if (self._distanceTo(self._translate, rock.position) <= rock.geometry.radius + 2 && (ige._currentTime - self.states.rockLastHarvested) >= 600) {
                    self.states.rockLastHarvested = ige._currentTime;
                    //harvesting!
                    rockFound = true;
                    self.states.isScratching = true;
                    if (this._scratchStopTimeout) clearTimeout(self._scratchStopTimeout);
                    self._scratchStopTimeout = undefined;
                    // Add to own gold
                    this.values.gold += 5;
                    //send update to all clients
                    this.addStreamData('playerHarvest', 5);
                    break;
                }
            }
        }

        //if it was a normal attack i.e. he wasn't just scratching...
        if (!rockFound && !self.states.isScratching) {
            //...add a timeout for the next attack, change the attack type and forward the values to the players
            self._forwardAttribute('states', 'attackType', self.states.attackType);
            self._forwardAttribute('states', 'isAttacking', true);
            //pause langer before the third hit from above
            var attackPause = 500;
            if (self.states.attackType == 2) attackPause = 750;
            if (self.states.attackType == 3) attackPause = 1000;
            self.states.nextPossibleAttack = ige._currentTime + attackPause;
            //next attack type
            self.states.attackType = (self.states.attackType + 1) % 3;
        }
    },
    _isEnemyAround: function() {
        this._updateThreeTransform();
        //self._threeObj.updateMatrix();
        this._threeObj.updateMatrixWorld();
        var possibleEnemies = this.getPlayersWithinRadius(2);
        for (var x = 0; x < possibleEnemies.length; x++) {
            if (possibleEnemies[x]._id == this._id) continue;
            return true;
        }
    },
    /* CEXCLUDE */
    getPlayersWithinRadius: function(radius) {
        var self = this;
        var players = [];

        for (var key in ige.server.players) {
            if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
            var enemy = ige.server.players[key];
            //calc distance

            if (self._distanceTo(self._translate, enemy._translate) <= radius) {
                //is within radius
                players.push(enemy);
            }
        }
        return players;
    },
    getBuildingsHit: function(radius) {
        var hitBuildings = [];
        var buildingsLength = ige.server.levelObjects.buildings.length;
        for (var x = 0; x < buildingsLength; x++) {
            var building = ige.server.levelObjects.buildings[x];
            var buildingMatrix = building._threeObj.matrixWorld;

            if (building._threeObj.geometry.boundingBox) {
                //Rectangle x1, x2, y1, y2
                var buildingCorner1 = new THREE.Vector3(building._threeObj.geometry.boundingBox.min.x, 0, building._threeObj.geometry.boundingBox.min.z).applyMatrix4(buildingMatrix),
                    buildingCorner2 = new THREE.Vector3(building._threeObj.geometry.boundingBox.max.x, 0, building._threeObj.geometry.boundingBox.max.z).applyMatrix4(buildingMatrix);

                //Fast check: is the player within the rectangle + radius area?
                if (this._translate.x >= buildingCorner1.x - radius && this._translate.x <= buildingCorner2.x + radius &&
                    this._translate.y >= buildingCorner1.y - radius && this._translate.y <= buildingCorner2.y + radius) {

                    //3 sensing devices as points. True, if one of the points is within the rectangle
                    var PI_2 = Math.PI * 2;
                    var rot = (self._rotate.y % PI_2 + PI_2) % PI_2;
                    var blockHitAngle = Math.PI * 0.35;

                    //is one of the points in the rectangle?
                    for (var x = -0.5; x < 0.6; x+=0.5) {
                        var angle = rot + x * blockHitAngle;
                        var sensingPoint = new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
                        if (sensingPoint.x >= buildingCorner1.x && sensingPoint.x <= buildingCorner2.x && sensingPoint.y >= buildingCorner1.y && sensingPoint.y <= buildingCorner2.y) {
                            //sensing point is within the rectangle!
                            hitBuildings.push(building);
                        }
                    }
                }
            } else if (building._threeObj.geometry.boundingSphere) {
                //TODO: Wenn die Distanz zwischen den Mittelpunkten zweier Kreise kleiner ist als die Summe ihrer Radien, so liegt eine Kollision vor
            }
        }
        return hitBuildings;
    },
    takeDamage: function(damage) {
        if (!ige.isServer) {
            //red glow
            this._threeObj.material.ambient = this.visuals.hitColor;
            if (this._hitTimeoutVisual) {
                clearTimeout(this._hitTimeoutVisual);
            }
            var self = this;
            this._hitTimeoutVisual = setTimeout(function() {
                self._threeObj.material.ambient = self._materialAmbientBackup;
            }, 200);
        }
        this._updateHealth(this.values.health - damage, false);
    },
    takeCommander: function() {
        if (!ige.isServer) {
            //try to take the commander spot. If it works, replace unit (ClientNetworkEvents)
            ige.network.send('playerTakesCommand');
        } else {
            if (ige.server.commanders[this.faction] == undefined) {
                ige.server.commanders[this.faction] = this.id();
                //give player commander abilities
                this.addComponent(PlayerCommanderComponent);
                this.addStreamData('playerSetComponent', {add: true, component: 'PlayerCommanderComponent'});
                //promote commander change to players
                ige.server.addStreamDataToAll('commanderChange', {val: this.values.name});
            }
        }
    },
    toggleVoiceMode: function() {
        if (!ige.isServer) {
            this.states.isUsingVoice = !this.states.isUsingVoice;
            // toggle buildingMenu
            UI.voiceCommands.display(this.states.isUsingVoice);
        }
    },
    playVoiceCommand: function(data) {
        if (ige.isServer) {
            this.addStreamData('playVoiceCommand', data);
        }
    },
    vote: function(isYes) {
        if (!ige.isServer) {
            ige.network.send('playerVote', isYes);
        } else {
            var voteData = ige.server.gameStates.votes[this.faction];
            if (voteData && voteData.playersVoted.indexOf(this.id() == -1)) {
                voteData.votes[isYes ? 'yes' : 'no']++;
                voteData.playersVoted.push(this.id());
            }
        }
    },
    donateToTeam: function(resourceId, amount) {
        if (resourceId == 1) {
            if (this.values.gold >= amount) {
                this.values.gold -= amount;
                var mainBuilding = this.getMainBuilding();
                mainBuilding.values.gold += amount;
                this.addStreamData('syncGold', this.values.gold);
            }
        }
    },
    getMainBuilding: function() {
        return ige.$('mainBuilding' + (this.faction == 'lizards' ? 'Lizards' : 'Meerkats'));
    },
    sendChatMessage: function(data) {
        data.playerName = this.values.name;
        this.getMainBuilding().sendChatMessage(data);
        this.getMainBuilding().sendChatMessage(data);
    },
    /**
     * Can be called for manually updating AND synchronizing health.
     * @param health
     * @param synchronize Update the client with that health?
     * @private
     */
    _updateHealth: function(health, synchronize) {
        health = Math.max(health, 0);
        this.values.health = health;
        if (!ige.isServer) {
            //ui
            if (this._id == ige._player._id) UI.healthBar.setValue(health);
            this._healthbar.setPercent(100 / this.values.maxhealth * this.values.health);
        }
        /* CEXCLUDE */
        else {
            if (synchronize) {
                //send update to all clients
                this.addStreamData('updateHealth', {unit: this._id, health: health});
            }
        }
        /* CEXCLUDE */

        if (this.states.isDead && health > 0) {
            //revived. Can be on the field or in loading screen already
            this.states.isDead = false;
        }
        if (health == 0 && !this.states.isDead) {
            //died
            this.states.isDead = true;
            var reviveSeconds = 10;

            if (!ige.isServer) {
                this.states.isDying = true;
                UI.spawn.dying(reviveSeconds);
            }

            setTimeout(function() {
                this.states.isSpawned = false;
            }.bind(this), reviveSeconds * 1000);
        }
    },
    spawn: function(where, unit) {
        if (!ige.isServer) {
            // either "unit" is set by the server and he wants the player to spawn as unit xy,
            // OR the player requests a spawn at some position/building
            if (where) {
                // if the player can spawn
                if (!this.states.isSpawned) {
                    //request spawn to server
                    ige.network.send('playerRequestSpawn', where);
                }
            } else {
                this.states.isSpawned = true;
                this._setPlayerModel(unit);
                ige.client.requestPointerLock();
                UI.minimap.hide();
            }
        } else {
            //Set model (faction + unit type) and displays an animation
            var spawnBuilding = ige.$(where);
            if (spawnBuilding) {
                this.addStreamData('playerSpawn', {faction: this.faction, unit: unit}, this._id);

                this._threeObj.rotation.setFromRotationMatrix(spawnBuilding._threeObj.matrixWorld);
                this._threeObj.rotation.y -= Math.PI / 2;
                this._rotate.y = this._threeObj.rotation.y;
                this._threeObj.position.set(5, 5, 0).applyMatrix4(spawnBuilding._threeObj.matrixWorld);
                this._threeObj.__dirtyPosition = true;
                this._threeObj.__dirtyRotation = true;

                this.translateTo(this._threeObj.position.x, this._threeObj.position.y, this._threeObj.position.z); // - this._geometry.z2

                this._updateHealth(this.values.maxhealth, true);

                setTimeout(function() {
                    this.states.isSpawned = true;
                }.bind(this), 30);
            }
        }
    },
    //distance between two vec3d
    _distanceTo: function (v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    _angleDistance: function(x1, x2) {
        return Math.abs((x1 + Math.PI * 3 - x2) % (Math.PI * 2) - Math.PI);
    },
    _updateThreeTransform: function() {
        this._threeObj.position.x = this._translate.x;
        this._threeObj.position.y = this._translate.y;
        this._threeObj.position.z = this._translate.z;
        this._threeObj.rotation.x = this._rotate.x;
        this._threeObj.rotation.y = this._rotate.y;
        this._threeObj.rotation.z = this._rotate.z;
    },
    _resetAnimation: function(layer) {
        this._threeObj.animation.currentTime.time[layer] = 0.0;
    },
    _sendScratchStop: function() {
        this.states.isScratching = false;
        this.addStreamData('playerHarvest', 0);
    },
    _forwardAttribute: function(group, name, value, dontOverride) {
        //send values to all other players
        this.addStreamData('playerAttributeUpdate', {player: this._id, group: group, name: name, value: value}, !dontOverride);
    },
    _setPlayerModel: function(unit) {

        var isPlayer = ige._player ? this.id() == ige._player.id() : false;

        //temp save old values and remove old model stuff
        if (this._threeObj) {
            this._threeObj.animation.stop();
            ige.client.scene1._threeObj.remove( this._threeObj );
        }

        var parsedModel;
        if (this.faction == 'meerkats') {
            var mat = new THREE.MeshLambertMaterial({
                //color: new THREE.Color('#FF0000'),
                //map: THREE.ImageUtils.loadTexture( './assets/textures/meerkat/MeerkatzTexture256BackV4.png' ),
                map: THREE.ImageUtils.loadTexture( './assets/textures/meerkat/meerkatTex1024.png' ),
                skinning: true
            });

            parsedModel = ige.three._loader.parse(modelMeerkat);
        } else {
            var mat = new THREE.MeshPhongMaterial({
                //color: new THREE.Color('#FF0000'),
                map: THREE.ImageUtils.loadTexture( './assets/textures/lizard/LizardTexture410V6.png' ),
                normalMap: THREE.ImageUtils.loadTexture( './assets/textures/lizard/LizardTexture410V6_NRM.png' ),
                skinning: true
            });

            parsedModel = ige.three._loader.parse(modelLizard);
        }

        this._threeObj = new THREE.SkinnedMesh(
            parsedModel.geometry,
            mat,
            false
        );
        if (this.faction) this._threeObj.name = this.faction.substring(0,-1);
        ige.client.scene1._threeObj.add( this._threeObj );


        if (this.__threeSunlight != undefined) {
            this.__threeSunlight.target = this._threeObj;
            this._threeObj.add( this.__threeSunlight );
        }
        /*var physicalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.0);
         //physicalGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.5, 0) ); //move centerpoint to bottom
         this._threeObj.add(
         new THREE.Mesh(
         physicalGeometry,
         new THREE.MeshBasicMaterial({color: 0x0000ff}),
         false
         )
         );*/
        this._threeObj.castShadow = true;
        this._threeObj.receiveShadow = false;

        //animation

        THREE.AnimationHandler.add(this._threeObj.geometry.animation); //Overwrites existing animation

        // CATMULLROM is not working with our method
        //this._threeObj.animation = new THREE.Animation(this._threeObj, "ArmatureAction", THREE.AnimationHandler.CATMULLROM);
        this._threeObj.animation = new THREE.Animation(this._threeObj, "ArmatureAction", THREE.AnimationHandler.LINEAR);

        this._threeObj.animation.play();

        this._threeObj.animation.currentTime = {
            time: [0.0, 0.0]
        };

        this._previousAnimation = ['',''];

        //charge
        var chargeMat = new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture( './assets/textures/charge.png' ),
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        var chargeGeometry = new THREE.PlaneGeometry( 1, 0.5, 1, 1 );

        var chargeMesh1 = new THREE.Mesh(chargeGeometry, chargeMat);
        chargeMesh1.position = new THREE.Vector3(0.2,-0.3,0.3);
        chargeMesh1.rotation.y = - Math.PI / 2.5;
        this._threeObj.add(chargeMesh1);

        var chargeMesh2 = new THREE.Mesh(chargeGeometry, chargeMat);
        chargeMesh2.position = new THREE.Vector3(-0.2,-0.3,0.3);
        chargeMesh2.rotation.y = - Math.PI / 1.7;
        this._threeObj.add(chargeMesh2);
        this._threeObj.chargeElements = chargeMat;

        this._healthbar = new Healthbar({
            entity: this,
            healthPercent: 100
        });

        this._nametag = new Nametag({
            entity: this,
            scale: 1
        });

        if (isPlayer) ige.client.vp1.camera.mount(this);
    },
    _checkResetAnimation: function(selectedAnimation, layer) {
        if (this._previousAnimation[layer] != selectedAnimation) {
            this._resetAnimation(layer);
        }
        this._previousAnimation[layer] = selectedAnimation;
    },
    _numKeyChanged: function(keyNr, isUp) {
        //how to react to a number (0..9) pressed? Override on sub classes

        if (!ige.isServer) {
            //display the key press graphics
            UI.buildingMenu.displayPressed(keyNr, isUp);
        }

        if (this.commander) this.commander._numKeyChanged(keyNr, isUp);
    },
    _setRunDirection: function() {
        this.states.runDirection = 0;
        if(this.controls.forwards){
            this.states.runDirection = 1;
        } else if (this.controls.backwards) {
            this.states.runDirection = 3;
        }

        if(this.controls.left) {
            this.states.runDirection = 4;
        } else if (this.controls.right) {
            this.states.runDirection = 2;
        }
    },
    /* CEXCLUDE */
    _findPhysijsObjectById: function(id) {
        var obj;
        var list = ige.server.scene1._threeObj._objects;
        /*for (var key in list) {
         if (key === 'length' || !list.hasOwnProperty(key)) continue;
         obj = list[key];
         if (obj && obj.id == id) return obj;
         }*/
        return list[id];
    },
    /* CEXCLUDE */
    destroy: function() {
        if (ige.isServer) {
            if (this.commander) {
                ige.server.commanders[this.faction] = undefined;
                if (this.commander.streamedBuilding) this.commander.streamedBuilding.destroy();
            }
        }
        IgeEntity.prototype.destroy.call(this);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }