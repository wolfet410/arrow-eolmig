var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/statistic',
	method: 'GET',
	description: 'Get all statistics',
	plural: 'statistics',
	singular: 'statistic',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statistic-get.js>action'
		}
 		Dtcarrow.Statistic.readAll()
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