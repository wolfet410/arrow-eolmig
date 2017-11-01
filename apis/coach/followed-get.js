var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'coach',
	path: '/api/coach/followed',
	method: 'GET',
	description: 'Get list of coaches/schools followed by the authenticated player',
	singular: 'coach',
	plural: 'coachs',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'followed-get.js>action'
		}

		Dtcarrow.Coach.getFollowed(req)
			.then(function(toggleFollowedResult) {
				Dtcarrow.Common.nextSuccess(nextBase, toggleFollowedResult);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;