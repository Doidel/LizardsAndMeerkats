var Gear = IgeEntity.extend({
    classId: 'Gear',

    init: function (entity) {
        IgeEntity.prototype.init.call(this);

        this.entity = entity;
		
		if (!ige.isServer) {

            /* adding tools or weapons */
            // initialize handhold
            //this._threeObj.handhold = new Handhold('tool1');
            // modify bone update function to also update its world matrix
            // possibly do this only to skeletons you need it for, not for all bones
            var update = THREE.Bone.prototype.update;
            THREE.Bone.prototype.update = function(parentSkinMatrix, forceUpdate) {
                update.call(this, parentSkinMatrix, forceUpdate);
                this.updateMatrixWorld( true );
            };

            // add noop update function to Object3D prototype
            // so any Object3D may be a child of a Bone
            THREE.Object3D.prototype.update = function() {};
		} else {

        }
    },

    // add gear elements to player
    addGearElement: function(gearPartName, gearElement){
        var bone = this.entity._threeObj.bones[Gear.boneNames[gearPartName]];
        this.removeOldGearElement(bone);
        bone.add(gearElement._threeObj);
    },
    removeOldGearElement: function(boneMesh){
        var count = 0;
        var l = boneMesh.children.length
        while(count < l){
            var child = boneMesh.children[count];
            if(child.name == 'gearElement'){
                boneMesh.remove(child);
                break;
            }
            ++count;
        }
    },
    /**
     * Reattaches the gear to the player, usually called after a spawn.
     */
    reattachMeshes: function() {
        
    }
});


// Static functions

Gear.addGearElementToList = function(gearElement){
    Gear.gearList.push(gearElement);
    /*var category = 'tools';
    if (gearElement instanceof GearWeaponElement) {
        category = 'weapons';
    } else if (gearElement instanceof GearArmorElement) {
        category = 'armor';
    }
    Gear.list[category].push(gearElement);*/
}

Gear.gearList = [];

/*Gear.gearList = {
    tools: [
    ],
    weapons: [
    ],
    armor: [
    ]
}*/

Gear.boneNames = {
    torso: 1,
    head: 4,
    shoulderRight: 4,
    upperArmRight: 4,
    lowerArmRight: 4,
    handRight: 4,

    shoulderLeft: 4,
    upperArmLeft: 4,
    lowerArmLeft: 4,
    handLeft: 4,

    upperLegRight: 4,
    lowerLegRight: 4,
    footRight: 4,

    upperLegLeft: 4,
    lowerLegLeft: 4,
    footLeft: 4
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Gear; }