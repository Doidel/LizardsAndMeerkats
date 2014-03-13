var GoldOre = Building.extend({
    classId: 'GoldOre',

    init: function (id, position) {
        Building.prototype.init.call(this, id);

        if (!ige.isServer) {
            var geom = ige.three._loader.parse(modelBuildingGoldOre).geometry;
            //geom = new THREE.CubeGeometry(2, 2, 2);
            var tMap = THREE.ImageUtils.loadTexture( './assets/textures/buildings/goldOreMap.png' );
            var sMap = THREE.ImageUtils.loadTexture( './assets/textures/buildings/goldOreSpecMap.png');
            tMap.wrapS = tMap.wrapT = sMap.wrapS = sMap.wrapT = THREE.RepeatWrapping;
            var mat = new THREE.MeshPhongMaterial({
                map: tMap,
                specularMap: sMap,
                side: 2,
                specular: new THREE.Color(),
                shininess: 200
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

            var geom = new THREE.CubeGeometry(4.785, 8.52, 7.557);
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

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = GoldOre; }