var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'setting',
	path: '/api/setting/teamplayer/:teamPlayerId',
	method: 'GET',
	description: 'Get a single instance of teamplayer',
	parameters: {
		teamPlayerId: { description: 'teamPlayerId value', type: 'path' }
	},
	singular: 'teamplayer',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'teamplayerid-get.js>action'
		} 

		Dtcarrow.TeamPlayer.teamPlayerIdAllowed(req)
			.then(function(teamPlayerIdAllowedResults) {
				return Dtcarrow.TeamPlayer.read(req.params.teamPlayerId);
			})
			.done(function(readResult) {
				readResult.caller += '>readResult';
				Dtcarrow.Common.nextSuccess(nextBase, readResult);
			}, function(err) {
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 