var OutpostMeerkats = Building.extend({
    classId: 'OutpostMeerkats',

    init: function (id, position) {
        Building.prototype.init.call(this, id);
		
		this.faction = 'meerkats';

        if (!ige.isServer) {
            var geomPillars = ige.three._loader.parse(modelBuildingMeerkatOutpostPillars).geometry;
            var tMap = THREE.ImageUtils.loadTexture( './assets/textures/scenery/textureCamelthornTreeBark.jpg' );
            tMap.wrapS = tMap.wrapT = THREE.RepeatWrapping;

            var matPillars = new THREE.MeshLambertMaterial({
                map: tMap,
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            this._threeObj = new THREE.Mesh(
                geomPillars,
                matPillars
            );

            /* roof */
            var geomRoof = ige.three._loader.parse(modelBuildingMeerkatOutpostRoof).geometry;
            var tMapRoof = THREE.ImageUtils.loadTexture( './assets/textures/buildings/meerkatRoofTextureMap2048.png' );
            tMapRoof.wrapS = tMapRoof.wrapT = THREE.RepeatWrapping;
            var matRoof = new THREE.MeshLambertMaterial({
                map: tMapRoof,
                side: 2
                //color: new THREE.Color('#FF0000')
            });

            var meshRoof = new THREE.Mesh(
                geomRoof,
                matRoof
            );
            meshRoof.castShadow = true;

            this._threeObj.add(meshRoof);

            /*
             // physobj
             var geomP = new THREE.CylinderGeometry(1.5,1.5,7.35);
             var meshP = new THREE.Mesh(
             geomP,
             new THREE.MeshBasicMaterial({
             wireframe: true,
             color: 'red'
             })
             );
             this._threeObj.add(meshP);
             */


            this._threeObj.receiveShadow = true;
            this._threeObj.castShadow = true;
            this._threeObj.name = "OutpostMeerkats";

            //ige.client.scene1._threeObj.add(this._threeObj);
            this.mount(ige.client.scene1);
        }

        if (ige.isServer) {
            var stoneMaterial = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                .6, // low friction
                .2 // high restitution
            );

            var geom = new THREE.CylinderGeometry(1.5,1.5,7.35);
            /*
            geom.computeBoundingBox();
            var halfHeight = (geom.boundingBox.max.y - geom.boundingBox.min.y) / 2;
            geom.boundingBox.max.y -= halfHeight;
            geom.boundingBox.min.y -= halfHeight;
            */

            this._threeObj = new Physijs.CylinderMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

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

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = OutpostMeerkats; }