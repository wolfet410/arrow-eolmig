var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/player/:playerId/statistic',
	method: 'POST',
	description: 'Creates a new statistic for a player',
	parameters: {
		playerId: { description: 'playerId', type: 'path' },
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
			caller: 'statistic-post.js>action'
		}

		var statistic = {
			statisticId: req.params.statisticId,
			value: req.params.value,
			textValue: req.params.textValue
		};

	    Dtcarrow.Api.getPlayerCoachId(req, 'player')
	        .then(function(getPlayerCoachIdResult) {
	            if (getPlayerCoachIdResult.data != req.params.playerId) {
	                // Not a coach and playerId doesn't match the auth user's playerId
	                throw { success: false, status: 403, caller: 'statistics-post.js>getPlayerCoachIdResult', 
	                	data: 'Not the authenticated player' }
	            }

				return Dtcarrow.PlayerStatistic.create(req.params.playerId, statistic);
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