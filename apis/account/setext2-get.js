var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/account/setext2',
	method: 'GET',
	description: 'Get all tasks',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'setext2-get.js>action'
		}

		twarrow.Account.readSetext2()
			.then(function(readAllResult) {
				twarrow.Common.nextSuccess(nextBase, readAllResult);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				twarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;