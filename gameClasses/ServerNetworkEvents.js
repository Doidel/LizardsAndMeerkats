var ServerNetworkEvents = {
	/**
	 * Is called when the network tells us a new client has connected
	 * to the server. This is the point we can return true to reject
	 * the client connection if we wanted to.
	 * @param data The data object that contains any data sent from the client.
	 * @param clientId The client id of the client that sent the message.
	 * @private
	 */
	_onPlayerConnect: function (socket) {
		// Don't reject the client connection
		return false;
	},

	_onPlayerDisconnect: function (clientId) {
		// Remove the player from the game
		ige.server.players[clientId].destroy();

		// Remove the reference to the player entity
		// so that we don't leak memory
		delete ige.server.players[clientId];
	},

	_onPlayerEntity: function (data, clientId) {
		if (!ige.server.players[clientId]) {
			ige.server.players[clientId] = new Player(clientId)
                .streamMode(1)
				.mount(ige.server.scene1);

			// Tell the client to track their player entity
			ige.network.send('playerEntity', ige.server.players[clientId].id(), clientId);
		}
	},

	_onPlayerLeftDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.left = true;
        p._forwardAttribute('controls', 'left', true);
	},

	_onPlayerLeftUp: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.left = false;
        p._forwardAttribute('controls', 'left', false);
	},

	_onPlayerRightDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.right = true;
        p._forwardAttribute('controls', 'right', true);
	},

	_onPlayerRightUp: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.right = false;
        p._forwardAttribute('controls', 'right', false);
	},

    _onPlayerRotation: function (data, clientId) {
        ige.server.players[clientId].controls.rotation += parseFloat(data.movementX);
    },

	_onPlayerBackwardsDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.backwards = true;
        p._forwardAttribute('controls', 'backwards', true);
	},

	_onPlayerBackwardsUp: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.backwards = false;
        p._forwardAttribute('controls', 'backwards', false);
	},

    _onPlayerForwardsDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.forwards = true;
        p._forwardAttribute('controls', 'forwards', true);
    },

    _onPlayerForwardsUp: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.forwards = false;
        p._forwardAttribute('controls', 'forwards', false);
    },

    _onPlayerJumpDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.jump = true;
        p._forwardAttribute('states', 'isJumping', true);
    },

    _onPlayerJumpUp: function (data, clientId) {
        ige.server.players[clientId].controls.jump = false;
    },

    _onPlayerBlockDown: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.block = true;
        p._forwardAttribute('controls', 'block', true);
    },

    _onPlayerBlockUp: function (data, clientId) {
        var p = ige.server.players[clientId];
        p.controls.block = false;
        p._forwardAttribute('controls', 'block', false);
    },

    _onPlayerChargeLeapDown: function (data, clientId) {
        ige.server.players[clientId].controls.chargeLeap = true;
    },

    _onPlayerChargeLeapUp: function (data, clientId) {
        ige.server.players[clientId].controls.chargeLeap = false;
    },

    _onPlayerAttackDown: function (data, clientId) {
        ige.server.players[clientId].controls.attack = true;
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = ServerNetworkEvents; }