var GearToolElement = GearElement.extend({
    classId: 'GearToolElement',

    init: function (name, mesh) {

        GearElement.prototype.init.call(this, name, mesh);

        this.states.miningModifier = 3;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearToolElement; }