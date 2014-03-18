var GoldmineBuildingLizard = Building.extend({
    classId: 'GoldmineBuildingLizard',

    init: function (id, position) {
        Building.prototype.init.call(this, id);
		
		this.faction = 'lizards';

        if (!ige.isServer) {
            var geom = ige.three._loader.parse(modelBuildingLizardGoldmine).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var tMap = THREE.ImageUtils.loadTexture( './assets/textures/buildings/TextureOutpost1024.jpg' );
            tMap.wrapS = tMap.wrapT = THREE.RepeatWrapping;
            var mat = new THREE.MeshLambertMaterial({
                map: tMap,
                side: 2
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
                .9, // low friction
                .1 // high restitution
            );

            var geom = new THREE.CubeGeometry(3.086325, 5.8362, 2.04039);
            geom.computeBoundingBox();
            var halfHeight = (geom.boundingBox.max.y - geom.boundingBox.min.y) / 2;
            geom.boundingBox.max.y -= halfHeight;
            geom.boundingBox.min.y -= halfHeight;

            this._threeObj = new Physijs.BoxMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            this._threeObj.position.set(this._threeObj.position.x + 2.05,this._threeObj.position.y, this._threeObj.position.z + 0.022);

            if (this._id.indexOf('Stream') == -1) this.activatePhysics();

            this.mount(ige.server.scene1);

            ige.server.levelObjects.buildings.push(this);
        }

        if (position) {
            //when created by stream position can be undefined
            this._threeObj.position = position;
            this.translateTo(position.x, position.y, position.z);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GoldmineBuildingLizard; }