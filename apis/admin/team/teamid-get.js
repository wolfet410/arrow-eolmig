var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/team/:teamId',
	method: 'GET',
	description: 'Get a single team\'s information',
	parameters: {
		teamId: { description: 'teamId value', type: 'path' }
	},
	singular: 'team',
	plural: 'teams',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'teamid-get.js>action'
		} 

		Dtcarrow.Team.read(req.params.teamId)
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