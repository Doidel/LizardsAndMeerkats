var ResourceLoader = IgeClass.extend({
    classId: 'ResourceLoader',

    init: function () {
        this.resourcesLoaded = {};
        this.resourcesLoadedTextures = {};
        this.resourcesLoadedMaterials = {};
        var self = this;
        this.resourceGenerators = {
            'pickaxeMesh': function() {
                var geom = ige.three._loader.parse(modelToolPick).geometry;
                var material = this.getResourceMaterials('miningToolMaterial');
                return new THREE.Mesh(geom, material);
            },
            'modelToolHammer': function() {
                var geom = ige.three._loader.parse(modelToolHammer).geometry;
                var material = this.getResourceMaterials('miningToolMaterial');
                return new THREE.Mesh(geom, material);
            },
            'lizardStoneArmorBracelet': function() {
                var geom = ige.three._loader.parse(LizardStoneArmorBracelet).geometry;
                var material = this.getResourceMaterials('lizardOutpostMaterial');
                return new THREE.Mesh(geom, material);
            },
            'lizardStoneArmorBraceletSmall': function() {
                var geom = ige.three._loader.parse(LizardStoneArmorBraceletSmall).geometry;
                var material = this.getResourceMaterials('lizardOutpostMaterial');
                return new THREE.Mesh(geom, material);
            },
            'lizardStoneArmorStone': function() {
                var geom = ige.three._loader.parse(LizardStoneArmorStone).geometry;
                var material = this.getResourceMaterials('lizardStonePlateMaterial');
                return new THREE.Mesh(geom, material);
            }
        };

        this.textureGenerators = {
            'ToolsTexture512': function() {
                return THREE.ImageUtils.loadTexture( './assets/textures/tools/ToolsTexture512.png' );
            },
            'TextureOutpost1024': function() {
                return THREE.ImageUtils.loadTexture( './assets/textures/buildings/TextureOutpost1024.jpg' );
            },
            'StoneTextureArmor': function() {
                return THREE.ImageUtils.loadTexture( './assets/textures/scenery/StoneTextureArmor.jpg' );
            }
        };

        this.materialGenerators = {
            'miningToolMaterial': function() {
                var texture = this.getResourceTextures('ToolsTexture512');
                var material = new THREE.MeshLambertMaterial({map: texture});
                return material;
            },
            'lizardOutpostMaterial': function() {
                var texture = this.getResourceTextures('TextureOutpost1024');
                var material = new THREE.MeshLambertMaterial({map: texture});
                return material;
            },
            'lizardStonePlateMaterial': function() {
                var texture = this.getResourceTextures('StoneTextureArmor');
                var material = new THREE.MeshLambertMaterial({map: texture});
                return material;
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
    },

    /**
     * Load a predefined texture
     * Loads either from cache or generates it
     * @param id
     * @returns {*}
     */
    getResourceTextures: function(id) {
        var resource = this.resourcesLoadedTextures[id];
        if (!resource) {
            // if the resource has not yet been loaded, load from generator
            this.resourcesLoadedTextures[id] = this.textureGenerators[id].call(this);
            resource = this.resourcesLoadedTextures[id];
        }

        return resource;
    },

    /**
     * Load a predefined material
     * Loads either from cache or generates it
     * @param id
     * @returns {*}
     */
    getResourceMaterials: function(id) {
        var resource = this.resourcesLoadedMaterials[id];
        if (!resource) {
            // if the resource has not yet been loaded, load from generator
            this.resourcesLoadedMaterials[id] = this.materialGenerators[id].call(this);
            resource = this.resourcesLoadedMaterials[id];
        }

        return resource;
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ResourceLoader; }