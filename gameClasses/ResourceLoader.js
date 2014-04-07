var ResourceLoader = IgeClass.extend({
    classId: 'ResourceLoader',

    init: function () {
        this.resourcesLoaded = {};
        var self = this;
        this.resourceGenerators = {
            'pickaxeMesh': function() {
                return new THREE.Mesh(new THREE.CubeGeometry(0.25,0.25,0.25), new THREE.MeshBasicMaterial({color: 0x00ff00}));
            }
        };
    },

    /**
     * Load a predefined resource
     * Loads either from cache or generates it
     * @param id
     * @returns {*}
     */
    getResource: function(id) {
        var resource = this.resourcesLoaded[id];
        if (!resource) {
            // if the resource has not yet been loaded, load from generator
            this.resourcesLoaded[id] = this.resourceGenerators[id].call(this);
            resource = this.resourcesLoaded[id];
        }

        return resource;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ResourceLoader; }