var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/statistic/:playerStatisticId',
	method: 'PUT',
	description: 'Edits existing statistic for a given player',
	parameters: {
		playerId: { description: 'playerId', type: 'path' },
		playerStatisticId: { description: 'playerStatisticId', type: 'path' },
		statisticId: { description: 'statisticId' },
		value: { description: 'value', optional: true },
		textValue: { description: 'text value', optional: true }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statisticid-put.js>action'
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
					statisticId: req.params.statisticId,
					value: req.params.value,
					textValue: req.params.textValue
				}
				return Dtcarrow.PlayerStatistic.update(s);
			})
			.done(function(updateResult) {
				updateResult.caller += '>updateResult'
				Dtcarrow.Common.nextSuccess(nextBase, updateResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 