var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/statistic/:statisticId',
	method: 'GET',
	description: 'Get a single statistic\'s information',
	parameters: {
		statisticId: { description: 'statisticId value', type: 'path' }
	},
	singular: 'statistic',
	plural: 'statistics', 
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statisticid-get.js>action'
		}

		Dtcarrow.Statistic.read(req.params.statisticId)
			.done(function(readResult) {
				readResult.caller += '>readResult';
				Dtcarrow.Common.nextSuccess(nextBase, readResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 