var MainBuildingLizards = Building.extend({
    classId: 'MainBuildingLizards',

    init: function (id, position) {
        Building.prototype.init.call(this, id);

        if (!ige.isServer) {
            var geom = ige.three._loader.parse(modelBuildingLizard).geometry;
            geom = new THREE.CubeGeometry(2, 2, 2);
            var mat = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/buildings/BuildingLizardTextureSmall.png' ),
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            this._threeObj = new THREE.Mesh(
                geom,
                mat
            );

            this._threeObj.receiveShadow = true;
            this._threeObj.castShadow = true;

            //ige.client.scene1._threeObj.add(this._threeObj);
            this.mount(ige.client.scene1);
        }

        if (ige.isServer) {
            var stoneMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                .6, // low friction
                .2 // high restitution
            );

            var geom = new THREE.CubeGeometry(2, 2, 2);

            this._threeObj = new Physijs.BoxMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            if (this._id.indexOf('Stream') == -1) this.activatePhysics();

            this.mount(ige.server.scene1);
        }

        if (position) {
            //when created by stream position can be undefined
            this._threeObj.position = position;
            this.translateTo(position.x, position.y, position.z);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = MainBuildingLizards; }