var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player/:playerid',
	method: 'GET',
	description: 'Get individual player details',
	parameters: {
		playerid: { description: 'playerId', type: 'path' }
	},
	singular: 'players',
	plural: 'players',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'playerid-get.js>action'
		}

		if (req.params.playerid === 'following') {
			// There is a ridiculous bug that is causing this API to run when I request /api/player/following
			// I need to move on, so injecting the copy of this
			Dtcarrow.Player.getFollowing(req)
				.then(function(getFollowingResult) {
					var promises = [];
					getFollowingResult.data.forEach(function(coach) {
						promises.push(Dtcarrow.Coach.read(coach.coachId));
					});
					
					return Q.all(promises);
				})
				.then(function(promisesResult) {
					var outputs = [];
					promisesResult.forEach(function(p) {
						outputs.push(p.data);
					});

					nextOutput.status = 200;
					nextOutput.caller += '>promisesResult'
					nextOutput.data = outputs;
					Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
				})
				.done(null, function(err) {
					err.caller = nextOutput.caller + '>' + err.caller + '>fail';
					Dtcarrow.Common.nextFail(nextBase, err);
				});

		} else {
			Dtcarrow.Player.read(req.params.playerid)
				.then(function(readResult) {
					return getPlayerDetails(req, readResult.data)
				})
				.then(function(getPlayerDetailsResult) {
					getPlayerDetailsResult.data.fullName = getPlayerDetailsResult.data.firstName + ' ' + getPlayerDetailsResult.data.lastName;

					nextOutput.status = 200;
					nextOutput.caller += '>getPlayerDetailsResult'
					nextOutput.data = getPlayerDetailsResult.data;
					Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
				})
				.done(null, function(err) {
					err.caller = nextOutput.caller + '>' + err.caller + '>fail';
					Dtcarrow.Common.nextFail(nextBase, err);
				});
		}
	}
});

// Internal functions
function getPlayerDetails(req, player) {
    var deferred = Q.defer();

    var addStatisticsPromise = Dtcarrow.Player.addStatistics(player);
    var getFollowedPromise = Dtcarrow.Player.getFollowed(req, player);

    Q.spread([addStatisticsPromise, getFollowedPromise], function(addStatisticsResults, getFollowedResults) {
    	// Idk why, but addStatisticsResults & getFollowedResults contains results from both promises, so we only
    	// need to send one back
        deferred.resolve({ success: true, status: 200, caller: 'player-get.js>getPlayerDetails', 
            data: addStatisticsResults.data }); 
	})
    .done(null, function(err) {
console.warn(err);
        deferred.reject({ success: false, status: 500, caller: 'player-get.js>getPlayerDetails', 
            data: err }); 
    });

    return deferred.promise;

}

module.exports = Module;