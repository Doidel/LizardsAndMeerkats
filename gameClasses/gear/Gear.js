var Gear = IgeClass.extend({
    classId: 'Gear',

    init: function (entity) {
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
    equipGear: function(gearPartName, gearElement){
        var bone = this.entity._threeObj.bones[Gear.boneNames[gearPartName]];
        this.unequipGear(bone);
        bone.add(gearElement._threeObj.clone());
    },
    unequipGear: function(boneMesh){
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
    Gear.gearList[gearElement.name] = gearElement;
}

Gear.gearList = {};

Gear.boneNames = {
    torso: 1,
    head: 4,
    shoulderLeft: 9,
    upperArmLeft: 10,
    lowerArmLeft: 11,
    handLeft: 12,

    shoulderRight: 5,
    upperArmRight: 6,
    lowerArmRight: 7,
    handRight: 8,

    upperLegLeft: 18,
    lowerLegLeft: 19,
    footLeft: 20,

    upperLegRight: 14,
    lowerLegRight: 15,
    footRight: 16
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Gear; }