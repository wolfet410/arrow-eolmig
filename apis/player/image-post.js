var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/image',
	method: 'POST',
	description: 'Adds a new image for a player',
	parameters: {
		playerId: { description: 'playerId', type: 'path' },
		file: { description: 'image file', type: 'body' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'image-post.js>action'
		}

	    Dtcarrow.Api.getPlayerCoachId(req, 'player')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'image-post.js>getPlayerCoachIdResult', 
	                	data: 'Not the authenticated player' }
	            }

				return Dtcarrow.Image.create(req.params.playerId, req.params.file);
			})
			.done(function(createResult) {
				createResult.caller = nextOutput.caller + '>' + createResult.caller + '>createResult';
				Dtcarrow.Common.nextSuccess(nextBase, createResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;  