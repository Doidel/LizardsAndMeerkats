var Nametag = IgeEntity.extend({
    classId: 'Nametag',

    init: function (options) {
        IgeEntity.prototype.init.call(this);

        this.options = options; /* entity, scale */

        if (typeof(this.options.scale) == 'undefined') {
            this.options.scale = 1;
        }

        if (!ige.isServer && typeof(this.options.entity) != 'undefined') {

            var healthbarInnerMat = new THREE.SpriteMaterial( { useScreenCoordinates: false } );
            healthbarInnerMat.transparent = true;
            this._healthbarMat = healthbarInnerMat;
            var healthbarInnerSprite = new THREE.Sprite( healthbarInnerMat );

            this._threeObj = healthbarInnerSprite;
            this.translateTo(0,0.8,0);
            this.scaleTo( this.options.scale * 0.432, this.options.scale * 0.2, 1.0 );
            this.mount(this.options.entity);
            this.options.entity._threeObj.add(this._threeObj);

            this.setName();
        }
    },
    setName: function() {
        // create a canvas element
        var canvas1 = document.createElement('canvas');
        var context1 = canvas1.getContext('2d');
        context1.font = 'normal 60px "Freckle Face"';
        context1.fillStyle = "rgb(53, 163, 17)";
        context1.strokeStyle = 'black';
        context1.fillText(this.options.entity.values.name, 0, 50);
        context1.strokeText(this.options.entity.values.name, 0, 50);

        // canvas contents will be used for a texture
        var texture1 = new THREE.Texture(canvas1);
        texture1.needsUpdate = true;

        this._healthbarMat.map = texture1;
    },
    destroy: function() {
        this.unMount();
        this.options.entity._threeObj.remove(this._threeObj);
        //destroy canvas?
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Nametag; }