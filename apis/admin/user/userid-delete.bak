var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/user/:userId',
	method: 'DELETE',
	description: 'Deletes existing user (coach, player, or administrator)',
	parameters: {
		userId: { description: 'userId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'userid-delete.js>action'
		} 
		var user = { userId: req.params.userId };

		Dtcarrow.User.userExists(req.params.userId)
			.then(function(userExistsResult) {
				if (!userExistsResult.data) {
					err.status = 404;
					err.caller = '>userExistsResult';
					err.data = 'User does not exist, and cannot be deleted';
					throw err;
				}

				return Dtcarrow.AdminCoachPlayer.delete(user);
			})
			.then(function(acpDeleteResult) {
				return Dtcarrow.RoleRelationship.delete(user);
			})
			.then(function(rrDeleteResult) {
				return Dtcarrow.User.delete(user);
			})
			.then(function(userDeleteResult) {
				userDeleteResult.caller = nextOutput.caller + '>' + userDeleteResult.caller + '>userDeleteResult';
				Dtcarrow.Common.nextSuccess(nextBase, userDeleteResult);
				return;
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
				return;
			});
	}
});

module.exports = Module;