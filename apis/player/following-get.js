var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'player',
	path: '/api/player/following',
	method: 'GET',
	description: 'Get list of coaches following authenticated player',
// There are problems with the APIs, and the /api/player/:playerid API is sometimes being called when
// /api/player/following is entered, we have to use the same singular and plural names of the objects
// TODO: Fix API calling bug!
	singular: 'players',
	plural: 'players', 
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'following-get.js>action'
		}

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
	}
});

module.exports = Module;