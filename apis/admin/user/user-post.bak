var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/user',
	method: 'POST',
	description: 'Creates new user (coach, player, or administrator)',
	parameters: {
		email: { description: 'Email address used as user ID' },
		type: { description: 'One of "Coach", "Player", or "Admin" - note the values are case-sensitive' },
		firstName: { description: 'First name' },
		lastName: { description: 'Last name' },
		address: { description: 'Street address' },
		city: { description: 'City' },
		state: { description: 'Two character state abbreviation' },
		zip: { description: '5-digit zip code' },
		phone: { description: 'Phone number' },
		height: { description: 'Player\'s height', optional: true },
		weight: { description: 'Player\'s weight', optional: true },
		roles: { description: 'Array of user roles' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'user-post.js>action'
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

		var password = Dtcarrow.Password.randomPassword();
	    if (password.data.hash.length < 48) {
			nextOutput.status = 422;
			nextOutput.data = 'Password hash length too short';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
	        return;
	    }

	    var apikey = Dtcarrow.Password.newApikey();
	    if (!apikey.success || apikey.data.length < 32) {
			nextOutput.status = 422;
			nextOutput.data = 'Problems creating newApikey';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
	        return;
	    }

		Dtcarrow.User.emailExists(req.params.email)
			.then(function(emailExistsResult) {
				if (emailExistsResult.data !== false) {
					emailExistsResult.caller =  emailExistsResult.caller + '>emailExistsResult';
					emailExistsResult.data = 'This email address already exists in the User table';
					emailExistsResult.status = 409;
					throw emailExistsResult; 
				} else {
					// Actually create the user
					user = req.params;
					user.password = password.data;
					user.apikey = apikey.data;
					
					return createUser(user, next, resp);
				}
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});
 
// Internal functions
function createUser(newUser, next, resp) {
	var nextBase = {
		next: next, 
		resp: resp
	}
	var nextOutput = {
		caller: 'user-post.js>createUser'
	}

	Dtcarrow.User.create(newUser)
		.then(function(userCreateResult) {
			return Dtcarrow.AdminCoachPlayer.create(userCreateResult.data.id, newUser);
		})
		.then(function(acpCreateResult) {
			return Dtcarrow.RoleRelationship.create(acpCreateResult.data);
		})
		.then(function(rrCreateResult) {
			var subject = 'Welcome to Tipped Sports Recruiting!',
				body = '<html><h1>Welcome!</h1>'
					 + '<p>Your password is <span color="red">'
					 + newUser.password.password
					 + '</span></p>';
			return Dtcarrow.Common.sendEmail(rrCreateResult.data.email, subject, body);
		})
		.then(function(sendEmailResult) {
			nextOutput.status = 201;
			nextOutput.caller += '>createUser>success';
			
			// User object is too difficult to send back right now
			nextOutput.data = 'User created';
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
		})
		.done(null, function(err) {
			err.caller = nextOutput.caller + '>createUser>' + err.caller + '>fail';
			Dtcarrow.Common.nextFail(nextBase, err);
		});
}

module.exports = Module;    