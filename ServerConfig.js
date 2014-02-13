var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Player', path: './gameClasses/Player'},
        {name: 'PlayerCommanderComponent', path: './gameClasses/PlayerCommanderComponent'},
		{name: 'LevelRoomComponent', path: './gameClasses/LevelRoomComponent'},
		{name: 'StreamScene', path: './gameClasses/StreamScene'},
        {name: 'Building', path: './gameClasses/Building'},
        {name: 'MainBuildingLizards', path: './gameClasses/MainBuildingLizards'},
        {name: 'MainBuildingMeerkats', path: './gameClasses/MainBuildingMeerkats'},
        {name: 'OutpostLizards', path: './gameClasses/OutpostLizards'},
        {name: 'OutpostMeerkats', path: './gameClasses/OutpostMeerkats'},
        {name: 'THREE', path: './ige2912/engine/components/three/three.min'},
        {name: 'modelLizard', path: './models/modelLizard'},
        {name: 'LevelUtils', path: './levels/LevelUtils'},
        {name: 'Level1', path: './levels/Level1'},
        {name: 'Level2', path: './levels/Level2'},
        {name: 'Rock1', path: './levels/LevelObjects/Rock1'},
        {name: 'RockGold1', path: './levels/LevelObjects/RockGold1'},
        {name: 'Ammo', path: './ammo'},
        {name: 'physijs_worker_functions', path: './physijs_worker'},
        {name: 'Physijs', path: './physi'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }