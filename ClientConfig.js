var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',
		'./gameClasses/Player.js',
        './levels/level1.js',
		//'./gameClasses/TurretMouseAim.js',
        //'./Sparks.js',
        //'./CanvasShaders.js',
        //'./tween.min.js',

		/* Models */
		//'./models/modelSpaceFrigate6.js',
		//'./models/modelTurret.js',
        './models/modelLizard.js',
        './levels/LevelObjects/Plant1.js',
        './levels/LevelObjects/Rock1.js',
        './levels/LevelObjects/RockGold1.js',

		/* 3d filters */
		/*'../ige/engine/components/three/EffectComposer.js',
		'../ige/engine/components/three/RenderPass.js',
		'../ige/engine/components/three/ShaderExtras.js',
		'../ige/engine/components/three/BloomPass.js',
		'../ige/engine/components/three/FilmPass.js',
		'../ige/engine/components/three/DotScreenPass.js',
		'../ige/engine/components/three/TexturePass.js',
		'../ige/engine/components/three/ShaderPass.js',
		'../ige/engine/components/three/MaskPass.js',*/

		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }