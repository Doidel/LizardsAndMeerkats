var LevelRoomComponent = IgeClass.extend({
    classId: 'LevelRoomComponent',
	componentId: 'levelRoom',

    init: function (player, options) {
		this._player = player;
		this._tickTimer = 0;
		this._attachedEntities = [];
		this._clientRoomPosition = {
			x: undefined,
			y: undefined
		};
    },
	
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
		this._tickTimer += ige._tickDelta;
		//check for a level change every x miliseconds
		if (this._tickTimer / ige.server.gameOptions.networkLevelRoomCheckInterval > 1) {
			this._tickTimer -= ige.server.gameOptions.networkLevelRoomCheckInterval;
			this._clientLevelRoomChangedCheck();
		}
    },
	
	attachEntity: function(entity) {
		this._attachedEntities.push(entity);
	},
	
	_clientLevelRoomChangedCheck: function() {
		var roomPosX = this._player._translate.x % ige.server.gameOptions.networkRoomSize,
			roomPosY = this._player._translate.y % ige.server.gameOptions.networkRoomSize;
		if (roomPosX != this._clientRoomPosition.x && roomPosY != this._clientRoomPosition.y) {
			var clientId = this._player._id,
				streamRooms = [];
			ige.network.clientLeaveAllRooms(clientId);
			
			for (var x = roomPosX - 1; x <= roomPosX + 1; x++) {
				for (var y = roomPosY - 1; y <= roomPosY + 1; y++) {
					//set the stream rooms for the actual socket, which is always in sync with the player's stream rooms
					ige.network.clientJoinRoom(clientId, x + ':' + y);
					streamRooms.push(x + ':' + y);
				}
			}
			
			//set the stream rooms for the player and all entities
			this._player.setStreamRooms(streamRooms);
			for (e in this._attachedEntities) {
				e.setStreamRooms(streamRooms);
			}
			
			//save the new level room position
			this._clientRoomPosition.x = roomPosX;
			this._clientRoomPosition.y = roomPosY;
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = LevelRoomComponent; }