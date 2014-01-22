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
            groundHeightDifferenceThreshold: 0.5
        };

        this.states = {
            isBuilt: true,
            nextBuildableCheck: 0
        }

        this.streamSections(['transform']);
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
    isBuildable: function(color) {
        if (ige.isServer) {
            if (ige._currentTime > this.states.nextBuildableCheck) {
                this.states.nextBuildableCheck = ige._currentTime + 200; //call every 200 ms

                var buildable = true,
                    builder = ige.server.getCommander('lizards');

                //adjust building position to be in front of player
                this.translateTo(builder._translate.x, this._translate.y, builder._translate.z); //TODO Currently exactly at player position

                //(check for resources made before building selection)

                //check for flat terrain
                var flatTerrainData = this._isFlatTerrain();
                if (!flatTerrainData.buildable) buildable = false;

                //check for collisions

                //set the new building position (according to min height and in front of player)
                this.translateTo(this._translate.x, flatTerrainData.minGroundHeight, this._translate.z); //TODO: Ground height + half building height ('cause of centered centroid)

                //send client network command to execute client's "isBuildable" if "isGreen" changes
                ige.network.send('setStreamBuildingBuildable', buildable);
            }
        } else {
            //color building red/green according to isGreen
            //(new position is already automatically streamed to the client)
            switch (color) {
                case 0:
                    this._threeObj.material.emissive = new THREE.Color( 0xffffff );
                    break;
                case 1:
                    this._threeObj.material.emissive = new THREE.Color( 0x00ff00 );
                    break;
                case 2:
                    this._threeObj.material.emissive = new THREE.Color( 0xff0000 );
                    break;
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
    /* CEXCLUDE */
    finalPlaceBuilding: function() {
        //remove green/red fragment shader (client)

        //if isBuildable
        //remove resources
        //activate physics
        //activate abilities and functions
        //sent network command to finalPlaceBuildings on clients
    },
    _isFlatTerrain: function() {
        //TODO: Take rotation into account
        var vList = ige.server.scene1._terrain.geometry.vertices;
        var terrainDistanceUnit = vList[1].x - vList[0].x,
            width = this._threeObj._physijs.width,
            height = this._threeObj._physijs.depth,
            xPos = Math.floor((this._translate.x - width / 2) / terrainDistanceUnit),
            yPos = Math.floor((this._translate.y - height / 2) / terrainDistanceUnit),
            xSearchStart = Math.max(0, xPos),
            xSearchEnd = Math.min(256, xPos + Math.ceil(width / terrainDistanceUnit)),
            ySearchStart = Math.max(0, yPos),
            ySearchEnd = Math.min(256, yPos + Math.ceil(height / terrainDistanceUnit));

        var minGroundHeight = 99999, maxGroundHeight = -99999;
        for (var y = ySearchStart; y <= ySearchEnd; y++) {
            for (var x = xSearchStart; x <= xSearchEnd; x++) {
                if (vList[y * 257 + x].y > maxGroundHeight) {
                    maxGroundHeight = vList[y * 257 + x].y;
                }
                if (vList[y * 257 + x].y < minGroundHeight) {
                    minGroundHeight = vList[y * 257 + x].y;
                }
            }
        }

        //is the building height difference within the threshold?
        return {
            buildable: (maxGroundHeight - minGroundHeight) <= this.values.groundHeightDifferenceThreshold,
            minGroundHeight: minGroundHeight
        };
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