var GearElement = IgeEntity.extend({
    classId: 'GearElement',

    init: function (name, mesh) {
        IgeEntity.prototype.init.call(this);

        this.name = name;

        this.states = {
            condition: 100,
                weight: 10,
                price: 1
        };

		if (!ige.isServer) {
            this._threeObj = mesh.clone();
            this._threeObj.name = 'gearElement';
		} else {

        }
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearElement; }