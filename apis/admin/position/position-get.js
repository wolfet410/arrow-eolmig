var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/position',
	method: 'GET',
	description: 'Get all positions',
	plural: 'positions',
	singular: 'position',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'position-get.js>action'
		}
 		Dtcarrow.Position.readAll()
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