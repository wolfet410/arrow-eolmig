var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/team',
	method: 'POST',
	description: 'Creates new team',
	parameters: {
		name: { description: 'Team name' },
		sport: { 
			description: '{'
			+ '<br>&emsp;sportId: Integer ID'
			+ '<br>}' 
		},
		organization: { 
			description: '{'
			+ '<br>&emsp;organizationId: Integer ID'
			+ '<br>}' 
		}
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'team-post.js>action'
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

		Dtcarrow.Team.create(team)
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