var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player',
	method: 'GET',
	description: 'Get list of players',
	parameters: {
		sportId: { description: 'Optional sportId', optional: true }
	},
	singular: 'player',
	plural: 'players',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'player-get.js>action'
		}

		if (typeof sportId === 'undefined') { var sportId; }

		Dtcarrow.Player.readAll(sportId)
			.then(function(readAllResult) {
				var promises = [];
				readAllResult.data.forEach(function(player) {
					promises.push(getPlayerDetails(req, player));
				});
				
				return Q.all(promises);
			})
			.then(function(promisesResult) {
				var outputs = [];
				promisesResult.forEach(function(p) {
					p.data.fullName = p.data.firstName + ' ' + p.data.lastName;
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
        deferred.reject({ success: false, status: 500, caller: 'player-get.js>getPlayerDetails', 
            data: err }); 
    });

    return deferred.promise;

}

module.exports = Module;