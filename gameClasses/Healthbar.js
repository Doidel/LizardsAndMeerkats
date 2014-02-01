var Healthbar = IgeEntity.extend({
    classId: 'Healthbar',

    init: function (options) {
        IgeEntity.prototype.init.call(this);

        this.options = options; /* entity, healthpercent, scale */
        if (typeof(this.options.healthPercent) == 'undefined') {
            this.options.healthPercent = 100;
        }

        if (typeof(this.options.scale) == 'undefined') {
            this.options.scale = 1;
        }

        if (!ige.isServer) {
            //inner
            var healthbarInnerMat = new THREE.SpriteMaterial( { map: THREE.ImageUtils.loadTexture( './assets/ui/healthbarOuter.png' ), useScreenCoordinates: false } );
            var healthbarInnerSprite = new THREE.Sprite( healthbarInnerMat );

            //red part
            var healthbarRedMat = new THREE.SpriteMaterial( { map: THREE.ImageUtils.loadTexture( './assets/ui/healthbarRed.png' ), useScreenCoordinates: false } );
            var healthbarRedSprite = new THREE.Sprite( healthbarRedMat );
            healthbarRedSprite.scale.set( this.options.scale * 0.360 / 100 * this.options.healthPercent, this.options.scale * 0.063, 1.0 ); // imageWidth, imageHeight
            healthbarInnerSprite.add(healthbarRedSprite);

            this._healthBarRed = healthbarRedSprite;

            //outer
            var healthbarOuterMat = new THREE.SpriteMaterial( { map: THREE.ImageUtils.loadTexture( './assets/ui/healthbarInner.png' ), useScreenCoordinates: false } );
            var healthbarOuterSprite = new THREE.Sprite( healthbarOuterMat );
            healthbarOuterSprite.scale.set( this.options.scale * 0.432, this.options.scale * 0.069, 1.0 ); // imageWidth, imageHeight
            healthbarRedSprite.add(healthbarOuterSprite);

            this._threeObj = healthbarInnerSprite;
            this.translateTo(0,0.7,0);
            this.scaleTo( this.options.scale * 0.432, this.options.scale * 0.069, 1.0 );
            this.mount(this.options.entity);
            this.options.entity._threeObj.add(this._threeObj);
        }
    },
    setPercent: function(value) {
        if (value < 0 || value > 100) {
            value = 0;
        }
        this.options.healthPercent = value;
        this._healthBarRed.scale.x = (this.options.scale * 0.360 / 100 * value);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Healthbar; }