GearWeaponElement = GearElement.extend({
    classId: 'GearWeaponElement',

    init: function (name, mesh) {
        GearElement.prototype.init.call(this, name, mesh);
        this.states.strength = 10;
        this.states.hitRadius = 0.5;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearWeaponElement; }