var StreamScene = IgeScene2d.extend({
	classId: 'StreamScene',

	init: function() {
		IgeScene2d.prototype.init.call(this);

        //contains data and actions which have to be streamed to the client, e.g.
        //_streamActions['uH'] =  299 // identifier = 'updateHealth', value = 299
        this._streamActions = {};

        // Define the data sections that will be included in the stream
        this._streamActionSections = ['commanderChange','playerList'];
        this.streamSections([].concat(this._streamActionSections));


        if (ige.isServer) {
            new IgeInterval(function() {
                this.addStreamData('playerList', this.getPlayerOverview());
            }.bind(this), 30000);
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
	streamSectionData: function (sectionId, data) {
		// Check if the section is one that we are handling
		if (this._streamActionSections.indexOf(sectionId) != -1) {
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
                if (sectionId == 'playerList') {
                    UI.playerList.set(data);
                }
                else if (sectionId == 'commanderChange') {
                    UI.notifications.commanderChange(data);
                }
            }
        } else {
			// The section was not one that we handle here, so pass this
			// to the super-class streamSectionData() method - it handles
			// the "transform" section by itself
			return IgeEntity.prototype.streamSectionData.call(this, sectionId, data);
		}
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

    tick: function(ctx) {
        // Call the IgeEntity (super-class) tick() method
        IgeScene2d.prototype.tick.call(this, ctx);
    },

    getPlayerOverview: function() {
        var playerList = [[],[]];
        var players = ige.server.players;
        for (var key in ige.server.players) {
            if (key === 'length' || !ige.server.players.hasOwnProperty(key)) continue;
            playerList[players[key].faction == 'lizards' ? 0 : 1].push(players[key].values.name);
        }
        return playerList;
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = StreamScene; }