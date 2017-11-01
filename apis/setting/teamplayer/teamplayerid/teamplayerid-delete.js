var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/setting/teamplayer/:teamPlayerId',
	method: 'DELETE',
	description: 'Deletes existing teamplayer, removing player from a team',
	parameters: {
		teamPlayerId: { description: 'teamPlayerId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'teamplayerid-delete.js>action'
		} 

		var teamPlayer = {
			teamPlayerId: req.params.teamPlayerId,
		};

		Dtcarrow.TeamPlayer.teamPlayerIdAllowed(req)
			.then(function(teamPlayerIdAllowedResult) {
				return Dtcarrow.TeamPlayer.delete(teamPlayer);
			})
			.then(function(teamPlayerDeleteResult) {
				return Dtcarrow.TeamPlayerStatistic.deleteAllTeamPlayer(teamPlayer);	
			})
			.done(function(teamPlayerStatisticDeleteResult) {
				teamPlayerStatisticDeleteResult.caller += '>deleteResult'
				Dtcarrow.Common.nextSuccess(nextBase, teamPlayerStatisticDeleteResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 