var MainBuildingLizards = Building.extend({
    classId: 'MainBuildingLizards',

    init: function (id, position) {
        Building.prototype.init.call(this, id);

        if (!ige.isServer) {

            var mat = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/rock1.jpg' )
            });

            this._threeObj = new THREE.Mesh(
                new THREE.CubeGeometry(8, 8, 8),
                mat,
                false
            );

            this._threeObj.receiveShadow = true;
            this._threeObj.castShadow = true;

            ige.client.scene1._threeObj.add(this._threeObj);
        }

        if (ige.isServer) {

            var stoneMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                .6, // low friction
                .2 // high restitution
            );

            this._threeObj = new Physijs.BoxMesh(
                new THREE.CubeGeometry(8, 8, 8),
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            ige.server.scene1._threeObj.add( this._threeObj);

        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = MainBuildingLizards; }