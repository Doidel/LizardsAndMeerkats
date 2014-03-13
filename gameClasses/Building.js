var Building = IgeEntity.extend({
    classId: 'Building',

    init: function (id) {
        IgeEntity.prototype.init.call(this);

        if (id) {
            this.id(id);
        }

        //default values
        this.values = {
            health: 300,
            maxhealth: 300,
            healthregeneration: 0.005,
            groundHeightDifferenceThreshold: 0.1,
			builderId: 0
        };

        this.states = {
            isBuilt: true,
            nextBuildableCheck: 0,
            isBuildableAtCurrentPosition: false
        };
		
		if (!ige.isServer) {
			//Colors etc
			this.visuals = {
				hitColor: new THREE.Color(),
				materialAmbientBackup: new THREE.Color()
			};
			this.visuals.hitColor.setRGB(0.3,0.3,0);
			this.visuals.materialAmbientBackup.setRGB(0,0,0);
		} else {
            ige.server.levelObjects.buildings.push(this);
			this.streamSyncInterval(200);
        }		

        //contains data and actions which have to be streamed to the client, e.g.
        //_streamActions['uH'] =  299 // identifier = 'updateHealth', value = 299
        this._streamActions = {};
		
        this.streamSections(['transform']);
    },

    _getJSONStreamActionData: function(property) {
        if (this._streamActions.hasOwnProperty(property) && this._streamActions[property] != undefined) {
            var data = this._streamActions[property];
            delete this._streamActions[property];
            return JSON.stringify(data);
        }
    },

    addStreamData: function(id, data, keepOld) {
        //console.log(keepOld, typeof(this._streamActions[id]));
        if (keepOld === true && typeof(this._streamActions[id]) == 'object') {
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
        /* CEXCLUDE */
        if (ige.isServer) {
            if (!this.states.isBuilt) {
                this.isBuildable();
            }
        }
        /* CEXCLUDE */

        //// HEALTH REGEN
        /*if (this.values.health < this.values.maxhealth) {
            var diff = (this.values.healthregeneration*ige._tickDelta);
            this.values.health = Math.min(this.values.health + diff, this.values.maxhealth);
            this._updateHealth(this.values.health);
        }*/

        // Call the IgeEntity (super-class) tick() method
        IgeEntity.prototype.tick.call(this, ctx);
    },
    /**
     * A player enters the building
     */
    playerEnters: function() {
        var self = this;

    },
    takeDamage: function(damage) {
        //TODO: Adapt, still from Player.js
        if (!ige.isServer) {
            //red glow
            this._threeObj.material.emissive = this.visuals.hitColor;
            if (this._hitTimeoutVisual) {
                clearTimeout(this._hitTimeoutVisual);
            }
            var self = this;
            this._hitTimeoutVisual = setTimeout(function() {
                self._threeObj.material.emissive = self.visuals.materialAmbientBackup;
            }, 200);
        }
        this._updateHealth(this.values.health - damage, false);
    },
    isBuildable: function(color) {
        if (ige.isServer) {
            if (ige._currentTime > this.states.nextBuildableCheck) {
                this.states.nextBuildableCheck = ige._currentTime + 200; //call every 200 ms

                var buildable = 1,
                    builder = ige.server.players[this.values.builderId]; //TODO: If builder undefined remove building

                //adjust building position to be in front of player
                this.translateTo(
                    builder._translate.x - ( this._threeObj.geometry.boundingBox.max.z + 2) * Math.sin(builder._rotate.y),
                    this._translate.y,
                    builder._translate.z - ( this._threeObj.geometry.boundingBox.max.z + 2) * Math.cos(builder._rotate.y)
                );
                this.rotateTo(0, builder._rotate.y, 0);

                //(check for resources made before building selection)

                //check for flat terrain
                var flatTerrainData = this._isFlatTerrain();
                if (!flatTerrainData.buildable) buildable = 2;

                //check for collisions

                //set the new building position (+ half of object's height)
                this.translateTo(this._translate.x, flatTerrainData.minGroundHeight, this._translate.z); // + this._threeObj.geometry.boundingBox.max.y

                //send client network command to execute client's "isBuildable" if "isGreen" changes
                ige.network.send('setStreamBuildingBuildable', {id: this._id, color: buildable});

                //save the result for later use
                this.states.isBuildableAtCurrentPosition = buildable != 2;
            }
        } else {
            //color building red/green according to isGreen
            //(new position is already automatically streamed to the client)
            switch (color) {
                case 0:
                    this._threeObj.material.emissive = new THREE.Color( 0x000000 );
                    break;
                case 1:
                    this._threeObj.material.emissive = new THREE.Color( 0x00ff00 );
                    break;
                case 2:
                    this._threeObj.material.emissive = new THREE.Color( 0xff0000 );
                    break;
            }

            if (color == 0) {
                //the building was finally built
                this.states.isBuilt = true;
                this.streamMode(0);
            }
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
            this._healthbar.setPercent(100 / this.values.maxhealth * this.values.health);
        }
        /* CEXCLUDE */
        else {
            if (synchronize) {
                //send update to all clients
                //TODO: ige.network.send('updateHealth', {unit: this._id, health: health});
            }
        }
        /* CEXCLUDE */
    },
    /* CEXCLUDE */
    finalPlaceBuilding: function() {
        console.log('finalPlaceBuilding called');

        //if isBuildable
        if (!this.states.isBuildableAtCurrentPosition) return false;

        //remove resources

        //remove streaming and green/red fragment shader (client)
        this.states.isBuilt = true;
        this.streamMode(0);

        //create new id
        var newId = ige.newId();

        //sent network command to finalPlaceBuildings on clients
        ige.network.send('setStreamBuildingBuildable', {id: this._id, color: 0, newId: newId});

        //set new id
        this.id(newId);

        //activate physics
        this.translateTo(this._translate.x, this._translate.y, this._translate.z);
        this._threeObj.quaternion.setFromEuler(new THREE.Euler(this._rotate.x, this._rotate.y, this._rotate.z));
        this.activatePhysics();

        //activate abilities and functions
    },
    _isFlatTerrain: function() {
        //TODO: Take rotation into account
        var vList = ige.server.scene1._terrain.geometry.vertices;
        var terrainDistanceUnit = vList[1].x - vList[0].x, //assumes terrain is perfectly square
            terrainHalfWidth = ige.server.scene1._terrain._physijs.xsize / 2,
            terrainHalfHeight = ige.server.scene1._terrain._physijs.ysize / 2,
            width = this._threeObj._physijs.width,
            height = this._threeObj._physijs.depth,
            xPos = Math.floor((this._translate.x + terrainHalfWidth - width / 2) / terrainDistanceUnit), //assumes terrain is at 0/0
            yPos = Math.floor((this._translate.z + terrainHalfHeight - height / 2) / terrainDistanceUnit); //assumes terrain is at 0/0

        var minGroundHeight = 99999, maxGroundHeight = -99999;
		
		//new attempt with rotation
		
		var buildingCenterPosX = Math.floor((this._translate.x + terrainHalfWidth) / terrainDistanceUnit), //assumes terrain is at 0/0
            buildingCenterPosZ = Math.floor((this._translate.z + terrainHalfHeight) / terrainDistanceUnit), //assumes terrain is at 0/0
            deltaX = Math.cos(this._rotate.y),
            deltaY = Math.sin(this._rotate.y);

        //get the height of the provided point and compare it to the min and max
		var	_compareTerrainHeight = function(pos) {
            pos.x += buildingCenterPosX;
            pos.z += buildingCenterPosZ;
            //take 2 diagonal vertices and compute average (which is not fully correct but less complicated)
            var modifierZ = pos.z % 1, modifierX = pos.x % 1;
            var verticeHeights =
                (vList[Math.floor(pos.z) * 129 + Math.floor(pos.x)].z * modifierX +
                vList[Math.floor(pos.z) * 129 + Math.ceil(pos.x)].z * (1 - modifierX)) * modifierZ
                +
                (vList[Math.ceil(pos.z) * 129 + Math.floor(pos.x)].z * modifierX +
                vList[Math.ceil(pos.z) * 129 + Math.ceil(pos.x)].z * (1 - modifierX)) * (1 - modifierZ)
            ;
            /*var height = (
                vList[Math.ceil(pos.z) * 129 + Math.ceil(pos.x)].z * modifier1 +
                vList[Math.floor(pos.z) * 129 + Math.floor(pos.x)].z * (1-modifier1)
                );*/
            if (verticeHeights > maxGroundHeight) {
                maxGroundHeight = verticeHeights;
            }
            if (verticeHeights < minGroundHeight) {
                minGroundHeight = verticeHeights;
            }
        };
			
		
		var currentPosInObjectCoordinates = new THREE.Vector3(0,0,0),
			currentPosInTerrainCoordinates = new THREE.Vector2(0,0),
			buildingRotationMatrix = new THREE.Matrix4().extractRotation(this._threeObj.matrixWorld),
			halfObjectHeight = - (height / 2 / terrainDistanceUnit),
			halfObjectWidth = - (width / 2 / terrainDistanceUnit);
		
		//iterate in steps of terrainDistanceUnit from the object's left to right
		for (var z = 0; z <= Math.ceil(height / terrainDistanceUnit); z+= terrainDistanceUnit) {
			currentPosInObjectCoordinates.z = -halfObjectHeight + z; //TODO: cut last iteration

			//and the object's top to bottom
			for (var x = 0; x <= Math.ceil(width / terrainDistanceUnit); x++) {
				//(x, y) is now a point
				currentPosInObjectCoordinates.x = -halfObjectWidth + x; //TODO: cut last iteration

				//Apply the rotation to figure out the rotated point in terrain coordinates
				var terrainPos = currentPosInObjectCoordinates.clone().applyMatrix4(buildingRotationMatrix);
				
				var distanceToMid = currentPosInObjectCoordinates.length();
				currentPosInTerrainCoordinates.x = distanceToMid * deltaX;
				currentPosInTerrainCoordinates.y = distanceToMid * deltaY;
				
				_compareTerrainHeight(terrainPos);
				
				//currentPosInObjectCoordinates.applyMatrix4(this._threeObj.matrixWorld);
			}
		}

        console.log(minGroundHeight, maxGroundHeight);


        //is the building height difference within the threshold?
        return {
            buildable: (maxGroundHeight - minGroundHeight) <= this.values.groundHeightDifferenceThreshold,
            minGroundHeight: minGroundHeight,
            maxGroundHeight: maxGroundHeight
        };
    },
    activatePhysics: function() {
        ige.server.scene1._threeObj.add( this._threeObj );
        //console.log('physics values', this._threeObj._physijs.position, this._threeObj._physijs.rotation);
    },
    translateTo: function(x, y, z) {
        IgeEntity.prototype.translateTo.call(this, x, y, z);
        this._threeObj.position.set(x, y, z);
        this._threeObj.updateMatrixWorld(true);
        this._updateMinimap();
    },
    translateBy: function(x, y, z) {
        IgeEntity.prototype.translateBy.call(this, x, y, z);
        this._threeObj.position.set(x, y, z);
        this._threeObj.updateMatrixWorld(true);
        this._updateMinimap();
    },
    _updateMinimap: function() {
        if (!ige.isServer && this.id().indexOf('stream') == -1) {
            UI.minimap.setBuilding(this.id(), this._translate.x, this._translate.z);
        }
    }
    /*_forwardAttribute: function(group, name, value, includeSelf) {
        //send values to all other players
        for (var key in ige.server.players) {
            if (key === 'length' || !ige.server.players.hasOwnProperty(key) || (includeSelf != true && key == this._id)) continue;
            ige.network.send('playerAttributeUpdate', {player: this._id, group: group, name: name, value: value}, key);
        }
    }*/
    /* CEXCLUDE */
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Building; }