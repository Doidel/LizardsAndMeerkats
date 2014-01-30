var Player = IgeEntity.extend({
	classId: 'Player',

    //Ask SavXR Natsu for balances

	init: function (id) {
		IgeEntity.prototype.init.call(this);

		var self = this;

		if (id) {
			this.id(id);
		}

		if (!ige.isServer) {
            this._setPlayerModel();

            //Colors etc
            this.visuals = {
                hitColor: new THREE.Color()
            };
            this.visuals.hitColor.setRGB(0.3,0.3,0);
            this._materialAmbientBackup = this._threeObj.material.ambient;

            ige.client.addAudioPannerToMesh(this._threeObj);

            //events
            window.addEventListener('mousedown', function(event){
                if(ige.client.controls.enabled==true) {
                    if (event.which == 1) {
                        // build mode
                        console.log('building? ', self.states.buildingNr);
                        if(self.states.buildingNr >= 0){
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
                        if (!self.controls.block) {
                            // Record the new state
                            self.controls.block = true;

                            // Tell the server about our control change
                            ige.network.send('playerControlBlockDown');
                        }
                    } else if (event.which == 3) {
                        //chargeLeap
                        if (!self.controls.chargeLeap) {
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
		}

        if (ige.isServer) {

            //figure out the faction
            if (ige.server.gameStates.playerCounts.lizards == ige.server.gameStates.playerCounts.meerkats) {
                this.faction = Math.random() < 0.5 ? 'lizards' : 'meerkats';
            } else if (ige.server.gameStates.playerCounts.lizards < ige.server.gameStates.playerCounts.meerkats) {
                this.faction = 'lizards';
            } else {
                this.faction = 'meerkats';
            }
            ige.server.gameStates.playerCounts[this.faction]++;

           // var parsedModel = loader.parse(modelLizard);

            var playerMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                0, // friction
                0 // restitution
            );

            /*var physicalGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.0);
            //physicalGeometry.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.5, 0) ); //move centerpoint to bottom
            physicalGeometry.computeBoundingBox();
            physicalGeometry.boundingBox.max.y += physicalGeometry.boundingBox.min.y;
            physicalGeometry.boundingBox.min.y = 0;*/
            this._threeObj = new Physijs.CapsuleMesh(
                new THREE.CylinderGeometry(0.6, 0.3, 0.1),
                playerMaterial,
                5 //mass
            );
            this._threeObj.geometry.dynamic = false;
            this._threeObj.position.set(0,10,0);

            var upAxis = new THREE.Vector3(0,1,0);
            this._threeObj.addEventListener('collision', function( other_object, relative_velocity, relative_rotation, contact_normal ) {
                contact_normal.negate();
                if(contact_normal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
                    self.states.canJump = true;
            });
            this._threeObj.setAngularFactor({ x: 0, y: 0, z: 0 });
            ige.server.scene1._threeObj.add( this._threeObj );
        }


        this.states = {
            canJump: true,
            rockLastHarvested: ige._currentTime,
            isJumping: false,
            currentBlockFrame: 190,
            isScratching: false,
            isAttacking: false,
            attackType: 0, //0-2
            nextPossibleAttack: 0,
            standingStage: 0,
            nextStandingAnim: 0,
            isDying: false,
            noAnimation: false,
            isCharging: false,
            isBuilding: false,
            isRunning: false,
            isUsingVoice: false
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
            currentStamina: 100,
            maxStamina: 100,
            staminaregeneration: 0.01,
            health: 300,
            maxhealth: 300,
            healthregeneration: 0.005
        };

		// Define the data sections that will be included in the stream
		this.streamSections(['transform', 'stamina']);
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
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		if (sectionId === 'stamina') {
			// Check if the server sent us data, if not we are supposed
			// to return the data instead of set it
			if (data) {
				// We have been given new data!
                //ige.client.UI.blockBar.setPercent(100 / this.values.maxStamina * data);
			} else {
				// Return current data
				return this.values.currentStamina;
			}
		} else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
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

            var inputVelocity = new THREE.Vector3(0,0,0);
            var velocity = new THREE.Vector3(0,0,0);
            var velocityFactor = 0.2;

			/*if (this.controls.left) {
				//this.rotateBy(0, Math.radians(0.2 * ige._tickDelta), 0);
			} else if (this.controls.right) {
				//this.rotateBy(0, Math.radians(-0.2 * ige._tickDelta), 0);
			}*/

            if (this.controls.jump && this.states.canJump) {
                this.states.canJump = false;
                //this._cannonBody.applyImpulse(new CANNON.Vec3(0,100,0), new CANNON.Vec3(0,0,0));
                velocity.y = 20;
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
		}
		/* CEXCLUDE */

		if (!ige.isServer) {

            //player controls
            if (ige._player._id == this._id) {

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

                //which animation will have to be run?
                if (this.controls.forwards || this.controls.backwards || this.controls.left || this.controls.right) {
                    //running
                    var direction = 1, start = 1, end = 160;
                    if (this.controls.left && !this.controls.right) {
                        direction = 2; start = 900; end = 1059;
                    } else if (this.controls.right && !this.controls.left) {
                        direction = 3; start = 1090; end = 1249;
                    }

                    setTimeout(function() {self.states.isRunnig = [direction, start, end];}, 2*ige.network._latency + 130); //latency + halfOfStreamInterval + renderLatency + 30
                } else {
                    setTimeout(function() {self.states.isRunnig = false;}, 2*ige.network._latency + 130); //latency + halfOfStreamInterval + renderLatency
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

                for(var i=0; i<10; ++i){
                    if (ige.input.actionState('key' + i)) {
                        if (!this.controls['key' + i]) {
                            // Record the new state
                            this.controls['key' + i] = true;

                            // Tell the server about our control change
                            ige.network.send('playerControlNumKeyDown', i);
                            this._numKeyChanged(i, false);
                        }
                    } else {
                        if (this.controls['key' + i]) {
                            // Record the new state
                            this.controls['key' + i] = false;

                            // Tell the server about our control change
                            ige.network.send('playerControlNumKeyUp', i);
                            this._numKeyChanged(i, true);
                        }
                    }
                }
            }

            if (!this.states.noAnimation) {
                //legs animation
                if (this.states.isDying) {
                    this._checkResetAnimation('dying', 0);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 760, 800, 0, false, ige.client.armBones);
                } else if (this.states.isJumping) {
                    this._checkResetAnimation('jumping', 0);
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 290, 400, 0, false, ige.client.armBones);
                    if (frame >= 400) this.states.isJumping = false;
                } else if (this.controls.forwards || this.controls.backwards || this.controls.left || this.controls.right) {
                    var direction = 1, start = 1, end = 160;
                    if (this.controls.left && !this.controls.right) {
                        direction = 2; start = 900; end = 1059;
                    } else if (this.controls.right && !this.controls.left) {
                        direction = 3; start = 1090; end = 1249;
                    }
                    this._checkResetAnimation('running' + direction, 0);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 4, start, end, 0, true, ige.client.armBones);
                } else {
                    if (this._previousAnimation[0].indexOf('standing') == -1) this.states.nextStandingAnim = 0;
                    this._checkResetAnimation('standing' + this.states.standingStage, 0);
                    if (this.states.nextStandingAnim <= ige._currentTime) {
                        var start = 830, end = 840;
                        if (this.states.standingStage == 1) {
                            start = 840; end = 860;
                        } else if (this.states.standingStage == 2) {
                            start = 860; end = 870;
                        }
                        var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, start, end, 0, false, ige.client.armBones);
                        if (frame == 840 || frame == 860) this.states.nextStandingAnim = ige._currentTime + 3000;
                        if (frame >= end) this.states.standingStage = (this.states.standingStage + 1) % 3;
                    }
                }

                //arms animation
                if (this.states.isDying) {
                    this._checkResetAnimation('dying', 1);
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 760, 800, 1, false, ige.client.legBones);
                    if (frame >= 800) {
                        this.states.isDying = false;
                        this.states.noAnimation = true;
                    }
                } else if (this.states.isAttacking) {
                    this._checkResetAnimation('attack' + this.states.attackType, 1);
                    var start = 430, end = 480, speedUp = 2.4;
                    if (this.states.attackType == 1) {
                            start = 510; end = 580; speedUp = 4;
                    } else if (this.states.attackType == 2) {
                            start = 610; end = 680; speedUp = 3;
                    }
                    var frame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * speedUp, start, end, 1, false, ige.client.legBones);
                    if (frame >= end) this.states.isAttacking = false;
                } else if (this.controls.block) {
                    //if he's raising the block, start the raising animation. If not, do no animation.
                    if (this.states.currentBlockFrame < 210) {
                        if (this.states.currentBlockFrame == 190) this._resetAnimation(1);
                        this.states.currentBlockFrame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, 190, 210, 1, false, ige.client.legBones);
                        console.log('firstBlock', this.states.currentBlockFrame);
                    }
                } else if (this.states.currentBlockFrame > 190) {
                    //if (this.states.currentBlockFrame == 240) this._resetAnimation(1);
                    if (this.states.currentBlockFrame < 240) this._resetAnimation(1);
                    //lower-block animation
                    this.states.currentBlockFrame = this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, 240, 260, 1, false, ige.client.legBones);
                    console.log('middleBlock', this.states.currentBlockFrame);
                    if (this.states.currentBlockFrame >= 260) {
                        //reset animation
                        this.states.currentBlockFrame = 190;
                        this._resetAnimation(1);
                        console.log('lastBlock', this.states.currentBlockFrame);
                    }
                } else if (this.states.isScratching) {
                    this._checkResetAnimation('scratching', 1);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 / 2, 710, 725, 1, true, ige.client.legBones);
                } else if (this.states.isJumping) {
                    this._checkResetAnimation('jumping', 1);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 2, 290, 400, 1, false, ige.client.legBones);
                } else if (this.states.isRunnig != false) {
                    //running
                    if(this.states.isRunnig){
                        this._checkResetAnimation('running' + this.states.isRunnig[0], 1);
                        this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 4, this.states.isRunnig[1], this.states.isRunnig[2], 1, true, ige.client.legBones);
                    }
                } else {
                    //standing
                    this._checkResetAnimation('standing', 1);
                    //this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, 830, 831, 1, true, ige.client.legBones);
                    this._threeObj.animation.rangeUpdate(ige._tickDelta / 1000 * 3, 830, 870, 1, true, ige.client.legBones);

                }
            }

            //start block: 190 - 210
            //end block: 240 - 260
            //jump: 290 - 400
            //hit: 430 - 480, 510 - 580, 610 - 680
            //scratch: 710 - 725
            //death: 760 - 800
            //idle: 830-840, 840-860, 860-870
            //run left: 900 - 1059
            //run right: 1090 - 1249
        }


        //// STAMINA
        if (this.values.currentStamina < this.values.maxStamina || this.controls.block) {
            var diff = (this.values.staminaregeneration*ige._tickDelta);
            if (this.controls.block) {
                this.values.currentStamina = Math.max(this.values.currentStamina - diff*2, 0);
            } else {
                this.values.currentStamina = Math.min(this.values.currentStamina + diff, this.values.maxStamina);
            }
            if (!ige.isServer) UI.blockBar.setPercent(100 / this.values.maxStamina * this.values.currentStamina);
        }

        //// HEALTH REGEN
        if (this.values.health < this.values.maxhealth) {
            var diff = (this.values.healthregeneration*ige._tickDelta);
            this.values.health = Math.min(this.values.health + diff, this.values.maxhealth);
            this._updateHealth(this.values.health);
        }

		// Call the IgeEntity (super-class) tick() method
		IgeEntity.prototype.tick.call(this, ctx);

        //update entity translations. needed for streaming.
        this.translateTo(this._threeObj.position.x, this._threeObj.position.y, this._threeObj.position.z); // - this._geometry.z2
	},
    /* CEXCLUDE */
    executeAttack: function() {
        var self = this;
        var PI_2 = Math.PI * 2;
        var blockHitAngle = Math.PI * 0.35;
        var rot = (self._rotate.y % PI_2 + PI_2) % PI_2;
        var enemyrot, t, localEnemyPosition, angle, isBlocked;
        var playersTakenHit = [];
        var enemyAround = self._isEnemyAround();

        //check for the actual hit 300ms later
        setTimeout(function() {
            self._updateThreeTransform();
            //self._threeObj.updateMatrix();
            self._threeObj.updateMatrixWorld();
            var possibleEnemies = self.getPlayersWithinRadius(2);
            for (var x = 0; x < possibleEnemies.length; x++) {
                if (possibleEnemies[x]._id == self._id) continue;
                isBlocked = false;
                if (possibleEnemies[x].controls.block) {
                    enemyrot = (possibleEnemies[x]._rotate.y % PI_2 + PI_2 + Math.PI) % PI_2; //+Math.PI because we want the enemy to face you in order to block
                    isBlocked = Math.abs(enemyrot - rot) < blockHitAngle;
                }
                t = possibleEnemies[x]._translate;
                //localEnemyPosition = self._threeObj.worldToLocal(new THREE.Vector3(t.x, t.y, t.z));
                localEnemyPosition = new THREE.Vector3(t.x, t.y, t.z).sub(self._translate);
                angle = Math.atan(localEnemyPosition.x / localEnemyPosition.z);
                if (localEnemyPosition.x <= 0 && localEnemyPosition.z <= 0) {
                    //change nothing
                } else if (localEnemyPosition.x <= 0 && localEnemyPosition.z >= 0) {
                    angle = Math.PI + angle;
                } else if (localEnemyPosition.x >= 0 && localEnemyPosition.z >= 0) {
                    angle += Math.PI;
                } else {
                    angle = 2*Math.PI + angle;
                }
                if (Math.abs(angle - rot) < blockHitAngle && !isBlocked) {
                    //hit
                    playersTakenHit.push(possibleEnemies[x]._id);
                    possibleEnemies[x].takeDamage(20);
                }
            }
            if (playersTakenHit.length > 0) {
                //send the hit to all players
                for (var key in ige.server.players) {
                    if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
                    ige.network.send('playersTakeHit', {hit: playersTakenHit, rawDamage: 20}, key);
                }
            }
        }, 300);

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
                    //send update to all clients
                    for (var key in ige.server.players) {
                        if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
                        ige.network.send('playerHarvest', {player: self._id, amount: 5}, key);
                    }
                    break;
                }
            }
        }

        //if it was a normal attack i.e. he wasn't just scratching...
        if (!rockFound && !self.states.isScratching) {
            //...add a timeout for the next attack, change the attack type and forward the values to the players
            self._forwardAttribute('states', 'attackType', self.states.attackType, true);
            self._forwardAttribute('states', 'isAttacking', true, true);
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
        this._updateHealth(this.values.health - damage, false)
    },
    takeCommander: function() {
        //try to take the commander spot. If it works, replace unit (ClientNetworkEvents)
        ige.network.send('playerTakesCommand');
    },
    toggleVoiceMode: function() {
        if (!ige.isServer) {
            this.states.isUsingVoice = !this.states.isUsingVoice;
            // toggle buildingMenu
            UI.voiceCommands.display(this.states.isUsingVoice);
        }
    },
    /**
     * Can be called for manually updating AND synchronizing health.
     * @param health
     * @param synchronize Update the client with that health?
     * @private
     */
    _updateHealth: function(health, synchronize) {
        this.values.health = health;
        if (!ige.isServer) {
            //ui
            if (this._id == ige._player._id) UI.healthBar.setValue(health);
        }
        /* CEXCLUDE */
        else {
            if (synchronize) {
                //send update to all clients
                for (var key in ige.server.players) {
                    if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
                    ige.network.send('playerUpdateHealth', {player: this._id, health: health}, key);
                }
            }
        }
        /* CEXCLUDE */
    },
    //distance between two vec3d
    _distanceTo: function (v1, v2) {
        var dx = v1.x - v2.x;
        var dy = v1.y - v2.y;
        var dz = v1.z - v2.z;

        return Math.sqrt(dx * dx + dy * dy + dz * dz);
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
        //send update to all clients
        for (var key in ige.server.players) {
            if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
            ige.network.send('playerHarvest', {player: this._id, amount: 0}, key);
        }
    },
    _forwardAttribute: function(group, name, value, includeSelf) {
        //send values to all other players
        for (var key in ige.server.players) {
            if (key === 'length' || !ige.server.players.hasOwnProperty(key) || (includeSelf != true && key == this._id)) continue;
            ige.network.send('playerAttributeUpdate', {player: this._id, group: group, name: name, value: value}, key);
        }
    },
    _setPlayerModel: function(faction, unit) {

        //temp save old values and remove old model stuff
        if (this._threeObj) {
            this._threeObj.animation.stop();
            ige.client.scene1._threeObj.remove( this._threeObj );
        }

        var mat = new THREE.MeshLambertMaterial({
            //color: new THREE.Color('#FF0000'),
            map: THREE.ImageUtils.loadTexture( './assets/textures/meerkat/MeerkatzTexture256BackV4.png' ),
            skinning: true
        });

        //var parsedModel = ige.three._loader.parse(modelLizard);
        var parsedModel = ige.three._loader.parse(modelMeerkat);
        this._threeObj = new THREE.SkinnedMesh(
            parsedModel.geometry,
            mat,
            false
        );
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

        this._threeObj.animation = new THREE.Animation(this._threeObj, "ArmatureAction", THREE.AnimationHandler.CATMULLROM);

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

        ige.client.vp1.camera.mount(this);
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
    }
    /* CEXCLUDE */
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Player; }