var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'coach',
	path: '/api/coach/:coachId/followed',
	method: 'PUT',
	description: 'Toggle whether coach is followed by the authenticated player',
	parameters: {
		coachId: { description: 'coachId', type: 'path' }
	},
	singular: 'coach',
	plural: 'coachs',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'followed-put.js>action'
		}

		Dtcarrow.Coach.toggleFollowed(req, req.params.coachId)
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