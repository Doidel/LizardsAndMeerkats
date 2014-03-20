var Gear = IgeEntity.extend({
    classId: 'Gear',
    gearParts: {
        torso: [],
        head: [],

        shoulderRight: [],
        upperArmRight: [],
        lowerArmRight: [],
        handRight: [],

        shoulderLeft: [],
        upperArmLeft: [],
        lowerArmLeft: [],
        handLeft: [],

        upperLegRight: [],
        lowerLegRight: [],
        footRight: [],

        upperLegLeft: [],
        lowerLegLeft: [],
        footLeft: []
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

            // create a mesh and add it to some bone
            //var mesh = new THREE.Mesh( new THREE.SphereGeometry(20), new THREE.MeshNormalMaterial() );

            // create a mesh and add it to some bone
            var m = new THREE.Mesh(new THREE.CubeGeometry(0.125,0.125,0.125,1), new THREE.MeshBasicMaterial({color: 'red', side: 2}));
            //this.playerMesh.add(m);

            // bonenames are inverted (right/left) on the model, but correct here

            var backBone = this.playerMesh.bones[1];
            var headBone = this.playerMesh.bones[4];

            var shoulderRightBone = this.playerMesh.bones[5];
            var upperArmRightBone = this.playerMesh.bones[6];
            var lowerArmRightBone = this.playerMesh.bones[7];
            var handRightBone = this.playerMesh.bones[8];

            var shoulderLeftBone = this.playerMesh.bones[9];
            var upperArmLeftBone = this.playerMesh.bones[10];
            var lowerArmLeftBone = this.playerMesh.bones[11];
            var handLeftBone = this.playerMesh.bones[12];

            var upperLegRightBone = this.playerMesh.bones[14];
            var lowerLegRightBone = this.playerMesh.bones[15];
            var footRightBone = this.playerMesh.bones[16];

            var upperLegLeftBone = this.playerMesh.bones[18];
            var lowerLegLeftBone = this.playerMesh.bones[19];
            var footLeftBone = this.playerMesh.bones[20];

            handRightBone.add(m);
		} else {

        }
    },

    // add gear elements
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

Gear.list = {
    tools: [
        //new GearToolElement(new THREE.Mesh(new THREE.CubeGeometry(0.25,0.25,0.25), new THREE.MeshBasicMaterial({color: 0x00ff00})))
    ],
    weapons: [
    ],
    armors: [
    ]
}

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Gear; }