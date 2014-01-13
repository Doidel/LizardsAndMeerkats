var Rock1 = IgeEntity.extend({
    classId: 'Rock1',

    init: function (position, radius) {
        IgeEntity.prototype.init.call(this);

        var self = this;

        var geom = new THREE.SphereGeometry (radius, 8, 8);

        //move the centerpoint
        position.y += radius;

        if (!ige.isServer) {
            
            var mat = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/rock1.jpg' )
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
                0,
                0
            );

            this._threeObj = new Physijs.SphereMesh(
                geom,
                stoneMaterial,
                0 //mass
            );
            //this._threeObj.geometry.dynamic = false;
            this._threeObj.position = position;

            ige.server.scene1._threeObj.add( this._threeObj);

        }


        this._threeObj.position = position;
        this.translateTo(position.x, position.y, position.z);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Rock1; }