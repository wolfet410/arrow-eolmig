var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/user',
	method: 'GET',
	description: 'Get a logged on user\'s information',
	singular: 'user',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'user-get.js>action'
		}

		twarrow.Api.getUserDetails(req)
			.then(function(getUserDetailsResult) {
				if (typeof getUserDetailsResult.data.reduceduser === 'undefined') {
					nextOutput.status = 422;
					nextOutput.success = false;
					nextOutput.caller += '>getUserDetailsResult';
					nextOutput.data = 'getUserDetails missing results';
					twarrow.Common.nextFail(nextBase, nextOutput);
					return;
				} else {
					return continueUserDetails(getUserDetailsResult.data.reduceduser, resp, next);
				}
				var user = results.reduceduser;
				twarrow.User.read(req.params.userId);
			})
			.fail(function(err) {
				console.warn(err);
			});
	}
});  

// Internal functions
function continueUserDetails(user, resp, next) {
	twarrow.User.read(user.userId)
		.then(function(user) {
			return twarrow.RoleRelationship.read(user[0]);
		})
		.then(function(details) {
			twarrow.Common.nextSuccess(next, resp, 200, details);
		})
		.fail(function(err) {
			twarrow.Common.log(err.message);
			twarrow.Common.nextFail(next, resp, err.status, err.message);
		});
}
 
module.exports = Module;            