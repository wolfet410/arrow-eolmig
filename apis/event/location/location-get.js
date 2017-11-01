var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/location',
	method: 'GET',
	description: 'Get all locations',
	plural: 'locations',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'location-get.js>action'
		}
 		Dtcarrow.Location.readAll()
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