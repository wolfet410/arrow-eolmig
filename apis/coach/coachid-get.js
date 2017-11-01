var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'coach',
	path: '/api/coach/:coachid',
	method: 'GET',
	description: 'Get individual coach details',
	parameters: {
		coachid: { description: 'coachId', type: 'path' }
	},
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

		Dtcarrow.Coach.read(req.params.coachid)
			.then(function(readResult) {
				nextOutput.status = 200;
				nextOutput.caller += '>readResult'
				nextOutput.data = readResult.data;
				Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;