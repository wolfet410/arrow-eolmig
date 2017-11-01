var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

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

		Dtcarrow.Api.getUserDetails(req)
			.then(function(getUserDetailsResult) {
				if (typeof getUserDetailsResult.data.reduceduser === 'undefined') {
					nextOutput.status = 422;
					nextOutput.success = false;
					nextOutput.caller += '>getUserDetailsResult';
					nextOutput.data = 'getUserDetails missing results';
					Dtcarrow.Common.nextFail(nextBase, nextOutput);
					return;
				} else {
					return continueUserDetails(getUserDetailsResult.data.reduceduser, resp, next);
				}
				var user = results.reduceduser;
				Dtcarrow.User.read(req.params.userId);
			})
			.fail(function(err) {
				console.warn(err);
			});
	}
});  

// Internal functions
function continueUserDetails(user, resp, next) {
	Dtcarrow.User.read(user.userId)
		.then(function(user) {
			return Dtcarrow.RoleRelationship.read(user[0]);
		})
		.then(function(user) {
			return Dtcarrow.AdminCoachPlayer.read(user);
		}) 
		.then(function(details) {
			Dtcarrow.Common.nextSuccess(next, resp, 200, details);
		})
		.fail(function(err) {
			Dtcarrow.Common.log(err.message);
			Dtcarrow.Common.nextFail(next, resp, err.status, err.message);
		});
}
 
module.exports = Module;            