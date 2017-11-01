var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'coach',
	path: '/api/coach',
	method: 'GET',
	description: 'Get all coaches by sport',
	singular: 'coach',
	plural: 'coaches',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'coachid-get.js>action'
		}

		Dtcarrow.Player.getSportId(req)
			.then(function(getSportIdResult) {
				return Dtcarrow.Coach.readAll(getSportIdResult.data.sportId);
			})
			.then(function(readAllResult) {
				var promises = [];
				readAllResult.data.forEach(function(coach) {
					promises.push(Dtcarrow.Coach.getFollowed(req, coach));
				});
				return Q.all(promises);
			})
			.then(function(promisesResult) {
				var outputs = [];
				promisesResult.forEach(function(p) {
					outputs.push(p.data)
				});
				nextOutput.status = 200;
				nextOutput.caller += '>readResult'
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