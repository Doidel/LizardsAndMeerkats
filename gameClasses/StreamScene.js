var StreamScene = IgeScene2d.extend({
	classId: 'StreamScene',

    //Ask SavXR Natsu for balances

	init: function() {
		IgeScene2d.prototype.init.call(this);

		if (ige.isServer) {
			
		}

        //contains data and actions which have to be streamed to the client, e.g.
        //_streamActions['uH'] =  299 // identifier = 'updateHealth', value = 299
        this._streamActions = {};

		// Define the data sections that will be included in the stream
		this.streamSections(['commanderChange']);
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
		if (sectionId == 'commanderChange') {
            if (data) {
                data = JSON.parse(data);
				UI.notifications.commanderChange(data.val);
            } else {
                return this._getJSONStreamActionData('commanderChange');
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

    addStreamData: function(id, data) {
        this._streamActions[id] = data;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = StreamScene; }