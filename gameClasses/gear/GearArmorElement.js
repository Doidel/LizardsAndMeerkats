GearArmorElement = GearElement.extend({
    classId: 'GearArmorElement',

    init: function (name, mesh, bodyPart) {
        GearElement.prototype.init.call(this, name, mesh);
        this.states.bodyPart = bodyPart;
        this.states.armor = 100;
    }

});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GearArmorElement; }