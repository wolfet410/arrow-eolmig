var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player/:playerId/statistic',
	method: 'GET',
	description: 'Get all statistics for a given playerId',
	parameters: {
		playerId: { description: 'playerId', type: 'path' }
	},
	plural: 'statistics',
	singular: 'statistic',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statistic-get.js>action'
		}

	    Dtcarrow.Api.getPlayerCoachId(req, 'unknown')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data.type !== 'coach' && getPlayerCoachIdResult.data.id != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'statistics-get.js>getPlayerCoachIdResult', 
	                	data: 'Not a coach and not the authenticated player' }
	            }

				return Dtcarrow.PlayerStatistic.readAll(req.params.playerId);
			})
			.done(function(readAllResult) {
				readAllResult.caller += '>readAllResult';
				Dtcarrow.Common.nextSuccess(nextBase, readAllResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;