var Arrow = require('arrow'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'event',
	path: '/api/event/:eventId',
	method: 'GET',
	description: 'Get a single event\'s information',
	parameters: {
		eventId: { description: 'eventId value', type: 'path' }
	},
	singular: 'event',
	plural: 'events', 
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'eventid-get.js>action'
		}

		var event = {};

		// Dtcarrow.Api.getPlayerCoachId(req, 'player')
		// 	.then(function(getPlayerCoachIdResults) {
		// 		event.playerId = getPlayerCoachIdResults.data;
				// return 
		Dtcarrow.PlayerEvent.read(req.params.eventId)
			.then(function(playerEventReadResult) {
				event.eventId = playerEventReadResult.data[0].eventId;
		        event.description = playerEventReadResult.data[0].eventDescription;
		        event.firstName = playerEventReadResult.data[0].firstName;
		        event.lastName = playerEventReadResult.data[0].lastName;
		        event.location = {
		            locationId: playerEventReadResult.data[0].locationId
		        };
		        event.section = {
		        	sectionId: playerEventReadResult.data[0].sectionId,
		        	sectionTypeDescription: playerEventReadResult.data[0].sectionTypeDescription,
		        	sectionValue: playerEventReadResult.data[0].sectionValue
		        };
	            event.dateTime = playerEventReadResult.data[0].dateTime;
	            return Dtcarrow.Location.read(event.location.locationId);
			})
			.done(function(locationReadResult) {
				event.location.name = locationReadResult.data.name;
				event.location.address = locationReadResult.data.address;
				event.location.city = locationReadResult.data.city;
				event.location.state = locationReadResult.data.state;
				event.location.zip = locationReadResult.data.zip;

				nextOutput.success = true;
				nextOutput.status = 200;
				nextOutput.caller += '>rlocationReadResult';
				nextOutput.data = event;
				Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			}, function(err) {
    			err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 