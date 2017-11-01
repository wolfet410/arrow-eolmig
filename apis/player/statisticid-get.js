var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/statistic/:statisticId',
	method: 'GET',
	description: 'Get a single statistic\'s information for a given player',
	parameters: {
		playerId: { description: 'playerId', type: 'path' },
		statisticId: { description: 'statisticId', type: 'path' }
	},
	singular: 'statistic',
	plural: 'statistics', 
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statisticid-get.js>action'
		}

	    Dtcarrow.Api.getPlayerCoachId(req, 'player')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'statisticid-delete.js>getPlayerCoachIdResult', 
	                	data: 'Not the authenticated player' }
	            }

				return Dtcarrow.PlayerStatistic.read(req.params.statisticId)
			})		
			.done(function(readResult) {
				readResult.caller += '>readResult';
				Dtcarrow.Common.nextSuccess(nextBase, readResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 