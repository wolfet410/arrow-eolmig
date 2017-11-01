var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/event',
	method: 'POST',
	description: 'Creates new event, location, and section for authenticated player',
	parameters: {
		description: { description: 'Event description' },
		dateTime: { description: 'Date and time' },
		location: { 
			description: '{'
			+ '<br>&emsp;name: Location name'
			+ '<br>&emsp;address: Location address'
			+ '<br>&emsp;city: Location city'
			+ '<br>&emsp;state: Location state'
			+ '<br>&emsp;zip: Location zip'
			+ '<br>}' 
		},
		section: { 
			description: '{'
			+ '<br>&emsp;sectionType: {'
			+ '<br>&emsp;&emsp;sectionTypeId: Section Type ID'
			+ '<br>&emsp;},'
			+ '<br>&emsp;value: Section value'
			+ '<br>}' 
		}
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		};
		var nextOutput = {
			caller: 'event-post.js>action'
		};
		var event = {
			description: req.params.description,
			dateTime: req.params.dateTime
		};
		var playerId;

		Dtcarrow.Api.getPlayerCoachId(req, 'player')
			.then(function(playerIdResult) {
				playerId = playerIdResult.data;
				return Dtcarrow.Section.create(req.params.section);
			})			
			.then(function(sectionCreateResult) {
				event.sectionId = sectionCreateResult.data.id;
				return Dtcarrow.Location.create(req.params.location);
			})
			.then(function(locationCreateResult) {
				event.locationId = locationCreateResult.data.id;
				return Dtcarrow.PlayerEvent.create(playerId, event);
			})
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