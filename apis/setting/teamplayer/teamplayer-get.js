var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/setting/teamplayer',
	method: 'GET',
	description: 'Gets all teamplayer records for auth player',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'teamplayer-get.js>action'
		}

		var teamplayer = {};

		Dtcarrow.Api.getUserDetails(req)
			.then(function(getUserDetailsResult) {
				teamplayer.admincoachplayerId = getUserDetailsResult.data.reduceduser.admincoachplayerId;
				return Dtcarrow.User.getType(getUserDetailsResult.data.reduceduser.userId);
			})
			.then(function(getTypeResult) {
				if (getTypeResult.data !== 'Player') {
					throw { success: false, status: 422, caller: nextOutput.caller + '>getTypeResult', 
						data: 'Not player type' }
				} else {
					// Since we know the type is Player, we can properly name the acpId now
					teamplayer.playerId = teamplayer.admincoachplayerId;
					delete teamplayer.admincoachplayerId;
				} 

				return Dtcarrow.TeamPlayer.readAll(teamplayer.playerId);
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