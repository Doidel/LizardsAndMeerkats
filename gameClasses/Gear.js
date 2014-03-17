var Gear = IgeEntity.extend({
    classId: 'Gear',

    init: function (playerMesh) {
        IgeEntity.prototype.init.call(this);

        /*
        if (id) {
            this.id(id);
        }
        */
		
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
            playerMesh.add(m);

            // get bone of right hand
            var bone = playerMesh.bones[12];
            bone.add(m);
		} else {

        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Gear; }