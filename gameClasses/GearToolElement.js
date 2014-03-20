var GearToolElement = GearElement.extend({
    classId: 'GearToolElement',

    init: function (mesh) {
        GearElement.prototype.init.call(this, mesh);
        this.status.miningModifier = 3;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearToolElement; }