var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/setting/teamplayer/:teamPlayerId',
	method: 'PUT',
	description: 'Edits existing teamplayer',
	parameters: {
		teamPlayerId: { description: 'teamPlayerId', type: 'path' },
		position: {
			description: '{'
			+ '<br>&emsp;positionId: Integer ID'
			+ '<br>}' 
		},
		jerseyNumber: { description: 'jersey number' },
		team: {
			description: '{'
			+ '<br>&emsp;teamId: Integer ID'
			+ '<br>}'
		}
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statisticid-put.js>action'
		}		

		var teamPlayer = req.params;

		// Set teamPlayer.playerId using the clientApikey to enforce additional security layer
		// inside Dtcarrow.TeamPlayer methods
		Dtcarrow.Api.getUserDetails(req)
			.then(function(getUserDetailsResult) {
				teamPlayer.admincoachplayerId = getUserDetailsResult.data.reduceduser.admincoachplayerId;
				return Dtcarrow.User.getType(getUserDetailsResult.data.reduceduser.userId);
			})
			.then(function(getTypeResult) {
				if (getTypeResult.data !== 'Player') {
					throw { success: false, status: 422, caller: nextOutput.caller + '>getTypeResult', 
						data: 'Not player type' }
				} else {
					// Since we know the type is Player, we can properly name the acpId now
					teamPlayer.playerId = teamPlayer.admincoachplayerId;
					delete teamPlayer.admincoachplayerId;
				} 

				return Dtcarrow.TeamPlayer.update(teamPlayer);
			})
			.done(function(updateResult) {
				updateResult.caller += '>updateResult';
				Dtcarrow.Common.nextSuccess(nextBase, updateResult);
			}, function(err) {
    			err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});

	}
});

module.exports = Module; 