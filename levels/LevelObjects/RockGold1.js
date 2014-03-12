var RockGold1 = IgeEntityCannon.extend({
    classId: 'RockGold1',

    init: function (position, radius) {
        IgeEntity.prototype.init.call(this);

        var self = this;

        var geom = new THREE.SphereGeometry (radius, 8, 8);

        //move the centerpoint
        position.y += radius;

        if (!ige.isServer) {

            var goldTex = THREE.ImageUtils.loadTexture( './assets/textures/rockGold1.jpg' );
            goldTex.wrapS = goldTex.wrapT = THREE.RepeatWrapping;
            goldTex.repeat.set( 4, 4 );

            var mat = new THREE.MeshLambertMaterial({
                map: goldTex
            });

            this._threeObj = new THREE.Mesh(
                geom,
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
                .9, // low friction
                .1 // high restitution
            );

            this._threeObj = new Physijs.SphereMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            ige.server.scene1._threeObj.add( this._threeObj);

            ige.server.levelObjects.goldRocks.push(this._threeObj);

        }


        this._threeObj.position = position;
        this.translateTo(position.x, position.y, position.z);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = RockGold1; }