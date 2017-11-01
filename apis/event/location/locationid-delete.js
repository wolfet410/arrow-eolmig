var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/location/:locationId',
	method: 'DELETE',
	description: 'Deletes existing location',
	parameters: {
		locationId: { description: 'locationId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'locationid-delete.js>action'
		} 

		Dtcarrow.Location.delete(req.params)
			.done(function(deleteResult) {
				deleteResult.caller += '>deleteResult';
				Dtcarrow.Common.nextSuccess(nextBase, deleteResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 