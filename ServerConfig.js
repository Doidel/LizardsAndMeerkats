var config = {
	include: [
		{name: 'ServerNetworkEvents', path: './gameClasses/ServerNetworkEvents'},
		{name: 'Player', path: './gameClasses/Player'},
        {name: 'THREE', path: './three.min'},
        {name: 'modelLizard', path: './models/modelLizard'},
        {name: 'CANNON', path: '../ige/engine/components/physics/cannon/lib_cannon'},
        {name: 'Levels', path: './levels/level1'},
        {name: 'Rock1', path: './levels/LevelObjects/Rock1'},
        {name: 'RockGold1', path: './levels/LevelObjects/RockGold1'},
        {name: 'Ammo', path: './ammo'},
        {name: 'physijs_worker_functions', path: './physijs_worker'},
        {name: 'Physijs', path: './physi'}
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = config; }