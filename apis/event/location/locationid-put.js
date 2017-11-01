var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/location/:locationId',
	method: 'PUT',
	description: 'Edits existing location',
	parameters: {
		locationId: { description: 'locationId', type: 'path' },
		name: { description: 'Location name' },
		address: { description: 'Address' },
		city: { description: 'City' },
		state: { description: 'State' },
		zip: { description: 'Zip code' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'locationid-put.js>action'
		}		

		Dtcarrow.Location.update(req.params)
			.done(function(updateResult) {
				updateResult.caller += '>updateResult'
				Dtcarrow.Common.nextSuccess(nextBase, updateResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 