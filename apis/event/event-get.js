var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event',
	method: 'GET',
	description: 'Get all events for the authenticated playerId or authenticated coachId',
	parameters: {
		followed: { description: 'Limit to events of followed players (coach only)', optional: true }
	},
	plural: 'events',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'event-get.js>action'
		}

		Dtcarrow.Api.getPlayerCoachId(req, 'unknown')
			.then(function(getPlayerCoachIdResults) {
				if (getPlayerCoachIdResults.data.type === 'coach') {
					return getFollowedEvents(req);
				} else if (getPlayerCoachIdResults.data.type === 'player') {
					return Dtcarrow.PlayerEvent.readAll(getPlayerCoachIdResults.data.id);
				} else {
					throw { success: false, status: 422, caller: 'getPlayerCoachIdResults', data: 'Unknown user type' };
				}
			})
			.done(function(eventResults) {
				eventResults.caller += '>eventResults';
				Dtcarrow.Common.nextSuccess(nextBase, eventResults);
			},
			function(err) {
    			err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

// Internal functions
function getFollowedEvents(req) {
	var deferred = Q.defer();

	Dtcarrow.Player.getFollowed(req)
		.then(function(getFollowedResults) {
			var promises = [];
			getFollowedResults.data.forEach(function(player) {
				promises.push(Dtcarrow.PlayerEvent.readAll(player.playerId));
			});
			
			// Return promises array of each followed players events
			return Q.all(promises);
		})
		.then(function(promisesResult) {
			var outputs = [];
			promisesResult.forEach(function (p) {
				p.data.forEach(function(e) {
					outputs.push(e);
				});
			});

			deferred.resolve({ success: true, status: 200, caller: 'getFollowedEvents', 
				data: outputs });
		})
		.done(null, function(err) {
	console.warn(err);
			deferred.reject({ success: false, status: 422, caller: 'getFollowedEvents', 
				data: err });
		});

	return deferred.promise;
}

module.exports = Module;    