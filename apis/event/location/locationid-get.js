var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/location/:locationId',
	method: 'GET',
	description: 'Get a single location\'s information',
	parameters: {
		locationId: { description: 'locationId value', type: 'path' }
	},
	singular: 'location',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'locationid-get.js>action'
		}

		Dtcarrow.Location.read(req.params.locationId)
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