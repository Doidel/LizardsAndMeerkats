var LevelRoomComponent = IgeClass.extend({
    classId: 'LevelRoomComponent',
	componentId: 'levelRoom',

    init: function (player, options) {
		this._player = player;
		this._tickTimer = ige.server.gameOptions.networkLevelRoomCheckInterval;
		this._attachedEntities = [];
		this._clientRoomPosition = {
			x: undefined,
			y: undefined
		};
        player.addBehaviour('levelRoom', this._behaviour);
        this._clientLevelRoomChangedCheck();
		//per default we join a stream room "ige" which we'll keep. We will not stream this
		//unit to "ige" though, "ige" will only be used for global streams.
    },
	
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    _behaviour: function (ctx) {
		this.levelRoom._tickTimer += ige._tickDelta;
		//check for a level change every x miliseconds
		if (this.levelRoom._tickTimer / ige.server.gameOptions.networkLevelRoomCheckInterval > 1) {
			this.levelRoom._tickTimer -= ige.server.gameOptions.networkLevelRoomCheckInterval;
			this.levelRoom._clientLevelRoomChangedCheck();
		}
    },
	
	attachEntity: function(entity) {
		this._attachedEntities.push(entity);
	},
	
	_clientLevelRoomChangedCheck: function() {
		var roomPosX = Math.floor(this._player._translate.x / ige.server.gameOptions.networkLevelRoomSize),
			roomPosY = Math.floor(this._player._translate.y / ige.server.gameOptions.networkLevelRoomSize);
		if (roomPosX != this._clientRoomPosition.x && roomPosY != this._clientRoomPosition.y) {
			var clientId = this._player._id,
				streamRooms = [];
			
			if (this._clientRoomPosition.x != undefined && this._clientRoomPosition.y != undefined) this._leaveAbandonedLevelRooms(roomPosX, roomPosY, clientId);
			
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
            console.log('entity rooms', this._player._streamRoomIds);
            //console.log('clientId rooms', ige.network._socketsByRoomId);
			
			//save the new level room position
			this._clientRoomPosition.x = roomPosX;
			this._clientRoomPosition.y = roomPosY;
		}
	},
	
	_leaveAbandonedLevelRooms: function(roomPosX, roomPosY, clientId) {
		for (var x = this._clientRoomPosition.x - 1; x <= this._clientRoomPosition.x + 1; x++) {
			for (var y = this._clientRoomPosition.y - 1; y <= this._clientRoomPosition.y + 1; y++) {
				if (x >= roomPosX - 1 && x <= roomPosX + 1 && y >= roomPosY - 1 && y <= roomPosY + 1) continue;
				//set the stream rooms for the actual socket, which is always in sync with the player's stream rooms
				ige.network.clientLeaveRoom(clientId, x + ':' + y);
			}
		}
	}
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = LevelRoomComponent; }