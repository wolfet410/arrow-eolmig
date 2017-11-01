var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/location',
	method: 'POST',
	description: 'Creates new location',
	parameters: {
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
			caller: 'location-post.js>action'
		}

		Dtcarrow.Location.create(req.params)
			.done(function(createResult) {
				createResult.caller += '>createResult';
				Dtcarrow.Common.nextSuccess(nextBase, createResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;  