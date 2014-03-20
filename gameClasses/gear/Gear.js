var Gear = IgeEntity.extend({
    classId: 'Gear',
    gearParts: {
        torso: 'none',
        head: 'none',

        shoulderRight: 'none',
        upperArmRight: 'none',
        lowerArmRight: 'none',
        handRight: 'none',

        shoulderLeft: 'none',
        upperArmLeft: 'none',
        lowerArmLeft: 'none',
        handLeft: 'none',

        upperLegRight: 'none',
        lowerLegRight: 'none',
        footRight: 'none',

        upperLegLeft: 'none',
        lowerLegLeft: 'none',
        footLeft: 'none'
    },

    init: function (playerMesh) {
        IgeEntity.prototype.init.call(this);

        /*
        if (id) {
            this.id(id);
        }
        */

        this.playerMesh = playerMesh;
		
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
        switch (gearPartName) {
            case 'torso':
                var backBone = this.playerMesh.bones[1];
                this.removeOldGearElement(backBone);
                backBone.add(gearElement._threeObj);
                break;
            case 'head':
                var headBone = this.playerMesh.bones[4];
                this.removeOldGearElement(headBone);
                headBone.add(gearElement._threeObj);
                break;
            case 'shoulderRight':
                var shoulderRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(shoulderRightBone);
                shoulderRightBone.add(gearElement._threeObj);
                break;
            case 'upperArmRight':
                var upperArmRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(upperArmRightBone);
                upperArmRightBone.add(gearElement._threeObj);
                break;
            case 'lowerArmRight':
                var lowerArmRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(lowerArmRightBone);
                lowerArmRightBone.add(gearElement._threeObj);
                break;
            case 'handRight':
                var handRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(handRightBone);
                handRightBone.add(gearElement._threeObj);
                break;
            case 'shoulderLeft':
                var shoulderLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(shoulderLeftBone);
                shoulderLeftBone.add(gearElement._threeObj);
                break;
            case 'upperArmLeft':
                var upperArmLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(upperArmLeftBone);
                upperArmLeftBone.add(gearElement._threeObj);
                break;
            case 'lowerArmLeft':
                var lowerArmLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(lowerArmLeftBone);
                lowerArmLeftBone.add(gearElement._threeObj);
                break;
            case 'handLeft':
                var handLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(handLeftBone);
                handLeftBone.add(gearElement._threeObj);
                break;
            case 'upperLegRight':
                var upperLegRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(upperLegRightBone);
                upperLegRightBone.add(gearElement._threeObj);
                break;
            case 'lowerLegRight':
                var lowerLegRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(lowerLegRightBone);
                lowerLegRightBone.add(gearElement._threeObj);
                break;
            case 'footRight':
                var footRightBone = this.playerMesh.bones[4];
                this.removeOldGearElement(footRightBone);
                footRightBone.add(gearElement._threeObj);
                break;
            case 'upperLegLeft':
                var upperLegLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(upperLegLeftBone);
                upperLegLeftBone.add(gearElement._threeObj);
                break;
            case 'lowerLegLeft':
                var lowerLegLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(lowerLegLeftBone);
                lowerLegLeftBone.add(gearElement._threeObj);
                break;
            case 'footLeft':
                var footLeftBone = this.playerMesh.bones[4];
                this.removeOldGearElement(footLeftBone);
                footLeftBone.add(gearElement._threeObj);
                break;
        }
    },
    removeOldGearElement: function(boneMesh){
        var found = false;
        var count = 0;
        while(!found && count<boneMesh.children.length){
            var child = boneMesh.children[count];
            if(child.name == 'gearElement'){
                boneMesh.remove(child);
                found = true;
            }
            ++count;
        }
    }
});

Gear.addGearElementToList = function(gearElement){
    switch(gearElement.classId()){
        case 'GearToolElement':
            Gear.list.tools.push(gearElement);
            break;
        case 'GearWeaponElement':
            Gear.list.weapons.push(gearElement);
            break;
        case 'GearArmorElement':
            Gear.list.armors.push(gearElement);
            break;
    };
}

Gear.list = {
    tools: [
    ],
    weapons: [
    ],
    armors: [
    ]
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Gear; }