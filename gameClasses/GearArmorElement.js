GearArmorElement = GearElement.extend({
    classId: 'GearArmorElement',

    init: function (mesh, bodyPart) {
        GearElement.prototype.init.call(this, mesh);
        this.status.bodyPart = bodyPart;
        this.status.armor = 100;
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearArmorElement; }