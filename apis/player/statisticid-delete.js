var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/statistic/:playerStatisticId',
	method: 'DELETE',
	description: 'Deletes a given statistic from a given player ',
	parameters: {
		playerId: { description: 'playerId', type: 'path' },
		playerStatisticId: { description: 'playerStatisticId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statisticid-delete.js>action'
		} 

	    Dtcarrow.Api.getPlayerCoachId(req, 'player')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'statisticid-delete.js>getPlayerCoachIdResult', 
	                	data: 'Not the authenticated player' }
	            }

				var s = {
					playerStatisticId: req.params.playerStatisticId,
				}
				return Dtcarrow.PlayerStatistic.delete(s);
			})
			.done(function(deleteResult) {
				deleteResult.caller += '>deleteResult'
				Dtcarrow.Common.nextSuccess(nextBase, deleteResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 