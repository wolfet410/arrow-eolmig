var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/image',
	method: 'GET',
	description: 'Gets all images for a player',
	parameters: {
		playerId: { description: 'playerId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'image-get.js>action'
		}

	    Dtcarrow.Api.getPlayerCoachId(req, 'player')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'image-post.js>getPlayerCoachIdResult', 
	                	data: 'Not the authenticated player' }
	            }

				return Dtcarrow.Image.readAll(req.params.playerId);
			})
			.done(function(readAllResult) {
				readAllResult.caller = nextOutput.caller + '>' + readAllResult.caller + '>readAllResult';
				Dtcarrow.Common.nextSuccess(nextBase, readAllResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;  