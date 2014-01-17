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
            healthregeneration: 0.005
        };

        this.states = {
            isBuilt: false,
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
                //(check for resources made before building selection)
                //check for flat terrain
                //check for collisions
                //send client network command to execute client's "isBuildable" if "isGreen" changes
                ige.network.send('setStreamBuildingBuildable', 1);
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