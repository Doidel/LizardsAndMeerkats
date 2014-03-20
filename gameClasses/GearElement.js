var GearElement = IgeEntity.extend({
    classId: 'GearElement',
    status: {
        condition: 100,
        weight: 10,
        price: 1
    },

    init: function (mesh) {
        IgeEntity.prototype.init.call(this);

		if (!ige.isServer) {
            this._threeObj = mesh.clone();
            this._threeObj.name = 'gearElement';
		} else {

        }
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearElement; }