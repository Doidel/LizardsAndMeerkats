GearWeaponElement = GearElement.extend({
    classId: 'GearWeaponElement',

    init: function (mesh) {
        GearElement.prototype.init.call(this, mesh);
        this.status.strength = 10;
        this.status.hitRadius = 0.5;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearWeaponElement; }