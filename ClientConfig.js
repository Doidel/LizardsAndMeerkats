var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./gameClasses/ClientNetworkEvents.js',
        './gameClasses/Player.js',
        './gameClasses/PlayerCommanderComponent.js',
        './gameClasses/Building.js',
        './gameClasses/MainBuildingLizards.js',
        './gameClasses/MainBuildingMeerkats.js',
        './gameClasses/OutpostLizards.js',
        './gameClasses/OutpostMeerkats.js',
        './gameClasses/GoldOre.js',
        './gameClasses/GoldmineBuildingLizard.js',
        './gameClasses/GoldmineBuildingMeerkat.js',
        './gameClasses/Healthbar.js',
        './gameClasses/Nametag.js',
        './gameClasses/StreamScene.js',
        './gameClasses/ResourceLoader.js',
        './gameClasses/gear/Gear.js',
        './gameClasses/gear/GearElement.js',
        './gameClasses/gear/GearToolElement.js',
        './gameClasses/gear/GearWeaponElement.js',
        './gameClasses/gear/GearArmorElement.js',
        './levels/LevelUtils.js',
        './levels/Level1.js',
        './levels/Level2.js',
		//'./gameClasses/TurretMouseAim.js',
        //'./Sparks.js',
        //'./CanvasShaders.js',
        //'./tween.min.js',

		/* Models */
        /* Characters */
		//'./models/modelSpaceFrigate6.js',
		//'./models/modelTurret.js',
        './models/modelLizard.js',
        './models/modelLizardV2.js',
        './models/modelMeerkat.js',
        /* Buildings */
        './models/buildings/modelBuildingLizard.js',
        './models/buildings/modelBuildingLizardOutpost.js',
        './models/buildings/modelBuildingLizardGoldmine.js',
        './models/buildings/modelBuildingStairsLizard.js',
        './models/buildings/modelBuildingLaternLizard.js',
        './models/buildings/modelBuildingLizardStatue.js',
        './models/buildings/modelBuildingMeerkatPillars.js',
        './models/buildings/modelBuildingMeerkatRoof.js',
        './models/buildings/modelBuildingMeerkatStairs.js',
        './models/buildings/modelBuildingMeerkatStone.js',
        './models/buildings/modelBuildingMeerkatVoodooMask.js',
        './models/buildings/modelBuildingMeerkatVoodooMaskPillar.js',
        './models/buildings/modelBuildingMeerkatFloor.js',
        './models/buildings/modelBuildingMeerkatOutpostPillars.js',
        './models/buildings/modelBuildingMeerkatOutpostRoof.js',
        './models/buildings/modelBuildingMeerkatGoldmine.js',
        './models/buildings/modelBuildingGoldOre.js',
        './levels/LevelObjects/Plant1.js',
        './levels/LevelObjects/Rock1.js',
        './levels/LevelObjects/RockGold1.js',
        './levels/LevelObjects/water-material.js',
        /* Vegetation */
        './models/vegetation/modelAngle60.js',
        './models/vegetation/modelCamelthorn.js',
        './models/vegetation/modelCamelthornLeaves.js',
        /* Tools */
        './models/tools/modelToolHammer.js',
        './models/tools/modelToolPick.js',
        /* Armor */
        './models/armor/LizardStoneArmorBracelet.js',
        './models/armor/LizardStoneArmorBraceletSmall.js',
        './models/armor/LizardStoneArmorStone.js',

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

        './gameClasses/SecurityTools.js',

		/* Standard game scripts */
		'./client.js',
		'./index.js'
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }