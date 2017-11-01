// TODO: This API needs some serious work!!!



var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/user/:userId',
	method: 'PUT',
	description: 'Edits existing user (coach, player, or administrator)',
	parameters: {
		email: { description: 'Email address used as user ID' },
		type: { description: 'One of "Coach", "Player", or "Admin" - note the values are case-sensitive' },
		enabled: { description: 'Account disabled or enabled' },
		firstName: { description: 'First name' },
		lastName: { description: 'Last name' },
		address: { description: 'Street address' },
		city: { description: 'City' },
		state: { description: 'Two character state abbreviation' },
		zip: { description: '5-digit zip code' },
		phone: { description: 'Phone number' },
		height: { description: 'Player\'s height', optional: true },
		weight: { description: 'Player\'s weight', optional: true },
		roles: { description: 'Array of user roles' },
		userId: { description: 'userId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'userid-put.js>action'
		}		

		if (req.params.type !== 'Coach' && req.params.type !== 'Player' && req.params.type !== 'Admin') {
			nextOutput.status = 422;
			nextOutput.data = 'Incorrect type, must be one of "Coach", "Player", or "Admin" '
				+ '- note the values are case-sensitive';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		if (req.params.roles.length < 1) {
			nextOutput.status = 422;
			nextOutput.data = 'No roles selected, users cannot be created without roles '
				+ 'assocated with either Admin, Coach, or Player';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		var userExistsPromise = Dtcarrow.User.userExists(req.params.userId);
		var checkEmailPromise = checkEmail(req.params.userId, req.params.email);

		Q.spread([userExistsPromise, checkEmailPromise], function(u, e) {
			if (u.data && e.data) {
				// User exists and new email address check out okay, so we can continue
				manageUpdateUser(req.params, resp, next);
			} else {
				if (!u.data) {
					nextOutput.status = 422;
					nextOutput.caller += '>userExistsPromise';
					nextOutput.data = 'userId does not exist in User table';
					Dtcarrow.Common.nextFail(nextBase, nextOutput);
					return;
				}
				if (!e.data) {
					nextOutput.status = 409;
					nextOutput.caller += '>emailExistsPromise';
					nextOutput.data = 'New email address already exists in the User table';
					Dtcarrow.Common.nextFail(nextBase, nextOutput);
				}
			}
		})
		.done(null, function(err) {
			err.caller = nextOutput.caller + '>' + err.caller + '>spread>fail';
			Dtcarrow.Common.nextFail(nextBase, err);
		});
	}
});

// Internal functions
function checkEmail(userId, newEmail) {
	// Checks if the email address matches the existing user, and if it doesn't 
	// ensures the newEmail does not already exist elsewhere in the User table
	// Returns true if already exists, false if not
	var deferred = Q.defer();

	var Model = Arrow.getModel('appc.mysql.eolmig/User');
	Model.query({ userId: userId }, function(err, user) {
		if (err) {
			deferred.reject({ success: false, status: 500, caller: 'userid-put.js>checkEmail',
                data: 'first query: ' + err });
			return deferred.promise;
		}
		if (user[0].email === newEmail) {
			// The user's email address matches what was sent to this API
			// No change, so we can pass this check
			deferred.resolve({ success: true, status: 200, caller: 'userid-put.js>checkEmail',
                data: true });
		} else {
			Dtcarrow.User.emailExists(newEmail)
				.done(function(emailExistsResult) {
					// If the email address exists, we want checkEmail to respond with a false
					// to alert the caller that we cannot continue
					if (emailExistsResult.data) {
						deferred.resolve({ success: true, status: 200, caller: 'userid-put.js>checkEmail>emailExistsResult',
                			data: false });
					} else {
						deferred.resolve({ success: true, status: 200, caller: 'userid-put.js>checkEmail>emailExistsResult',
                			data: true });
					}
				}),
				function(err) {
					deferred.reject({ success: false, status: 500, caller: 'userid-put.js>checkEmail>emailExistsResult',
                			data: err });
				}
		}
	});

	return deferred.promise;
}

function manageUpdateUser(params, resp, next) {
	Dtcarrow.User.update(params)
		.then(function(user) {
			return Dtcarrow.AdminCoachPlayer.update(user.data);
		})
		.then(function(user) {
			return Dtcarrow.RoleRelationship.delete(user.data);
		})
		.then(function(user) {
			return Dtcarrow.RoleRelationship.create(user.data);
		})
		.then(function(user) {
			nextOutput.status = 204;
			nextOutput.caller += '>manageUpdateUser>rrCreateResult';
			nextOutput.data = 'User successfully edited';
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			return;
		})
		.done(null, function(err) {
			err.caller = nextOutput.caller + '>' + err.caller + '>manageUpdateUser>fail';
			Dtcarrow.Common.nextFail(nextBase, err);
		});
}

module.exports = Module;  