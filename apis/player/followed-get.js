var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player/followed',
	method: 'GET',
	description: 'Get list of players followed by the authenticated coach',
	singular: 'player',
	plural: 'players',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'followed-get.js>action'
		}

		Dtcarrow.Player.getFollowed(req)
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