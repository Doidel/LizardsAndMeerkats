var PlayerCommander = Player.extend({
    classId: 'PlayerCommander',

    //Ask SavXR Natsu for balances

    init: function (id) {
        IgeEntity.prototype.init.call(this);

        var self = this;

        if (id) {
            this.id(id);
        }
    },
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {

    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerCommander; }