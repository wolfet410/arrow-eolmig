var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player/:playerId/followed',
	method: 'PUT',
	description: 'Toggle whether player is followed by the authenticated coach',
	parameters: {
		playerId: { description: 'playerId', type: 'path' }
	},
	singular: 'player',
	plural: 'players',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'followed-put.js>action'
		}

		Dtcarrow.Player.toggleFollowed(req, req.params.playerId)
			.then(function(toggleFollowedResult) {
				Dtcarrow.Common.nextSuccess(nextBase, toggleFollowedResult);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;