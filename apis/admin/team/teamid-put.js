var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/team/:teamId',
	method: 'PUT',
	description: 'Edits existing team',
	parameters: {
		teamId: { description: 'teamId', type: 'path' },
		name: { description: 'Team name' },
		sport: { description: 'Sport object: { sportId: Integer ID, description (Optional): Description }' },
		organization: { description: 'Organization object { organizationId: Integer ID, description (Optional): Description }' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'teamid-put.js>action'
		}		
		var check = {
			name: 'string',
			sport: {
				sportId: 'string'
			},
			organization: {
				organizationId: 'string'
			}
		}
		var team = Dtcarrow.Common.checkObject(req.params, check);
		if (!team) {
			nextOutput.status = 422;
			nextOutput.data = 'Inbound object does not match expectations!';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		Dtcarrow.Team.update(team)
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