var PlayerCommander = Player.extend({
    classId: 'PlayerCommander',

    //Ask SavXR Natsu for balances

    init: function (id) {
        Player.prototype.init.call(this, id);

        var self = this;

        if (id) {
            this.id(id);
        }

        // add hat
        var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
        var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});
        var hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.0;
        //this._threeObj.add(hat);
    },
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
        Player.prototype.tick.call(this, ctx);
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerCommander; }