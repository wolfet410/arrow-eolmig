var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/user',
	method: 'POST',
	description: 'Registers a new user (coach or player), which will be disabled by default'
		+ '<br>Similar to /api/admin/user; however this API is unsecured, so it offers slightly less'
		+ 'features',
	parameters: {
		email: { description: 'Email address used as user ID' },
		type: { description: 'One of "Coach" or "Player" - note the values are case-sensitive' },
		firstName: { description: 'First name' },
		lastName: { description: 'Last name' },
		address: { description: 'Street address' },
		city: { description: 'City' },
		state: { description: 'Two character state abbreviation' },
		zip: { description: '5-digit zip code' },
		phone: { description: 'Phone number' },
		sport: { description: 'Array of user sports' },
		sportId: { description: 'sportId' },
		// Player
		birthday: { description: 'Players birthday in yyyy-mm-dd format', optional: true },
		height: { description: 'Players height', optional: true },
		weight: { description: 'Players weight', optional: true },
		hsName: { description: 'Players high school name', optional: true },
		hsTeamName: { description: 'Players high school team name', optional: true },
		graduatingYear: { description: 'Players graduating year', optional: true },
		gpa: { description: 'Players gpa', optional: true },
		hsCoachName: { description: 'Players high school coach name', optional: true },
		hsCoachEmail: { description: 'Players high school coach email address', optional: true },
		hsCoachPhone: { description: 'Players high school coach phone number', optional: true },
		clubOrg: { description: 'Players club organization name', optional: true },
		clubTeamName: { description: 'Players club team name', optional: true },
		clubCoachName: { description: 'Players club coach name', optional: true },
		clubCoachEmail: { description: 'Players club coach email address', optional: true },
		clubCoachPhone: { description: 'Players club coach phone number', optional: true },
		hsAwards: { description: 'Players high school awards', optional: true },
		clubAwards: { description: 'Players club awards', optional: true },
		// Coach
		orgName: { description: 'Coachs organization (school) name', optional: true },
		teamName: { description: 'Coachs team name', optional: true },
		experience: { description: 'Coachs experience', optional: true },
		websiteTeam: { description: 'Coachs websiteTeam', optional: true },
		websiteSchool: { description: 'Coachs websiteSchool', optional: true },
		character: { description: 'Coachs character', optional: true },
		class2017: { description: 'Coachs class2017', optional: true },
		class2018: { description: 'Coachs class2018', optional: true },
		class2019: { description: 'Coachs class2019', optional: true }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'user-post.js>action'
		}
		var user = req.params;

		if (user.type !== 'Coach' && user.type !== 'Player') {
			nextOutput.status = 422;
			nextOutput.success = false;
			nextOutput.data = 'Incorrect type, must be one of "Coach" or "Player" '
				+ '- note the values are case-sensitive';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}
		// buildRolesArray(user)
		Dtcarrow.Role.getRoleFromSportType(user.sport.description, user.type)
			.then(function(getRoleFromSportTypeResult) {
				user.roles = [];
				user.roles.push(getRoleFromSportTypeResult.data);

				// New users automatically get the general user role
				user.roles.push({ roleId: 2, description: 'General User' });

				return Dtcarrow.User.emailExists(user.email);
			})		
			.then(function(emailExistsResult) {
				if (emailExistsResult.data) {
					err = {
						status: 409,
						success: false,
						caller: nextOutput.caller + '>emailExistsResult',
						data: 'This email address already exists in the User table'
					}
					throw err;
				} else {
					// Actually create the user
					var randomPasswordResult = Dtcarrow.Password.randomPassword();
				    if (!randomPasswordResult.success || randomPasswordResult.data.hash.length < 48) {
						err = {
							status: 422,
							success: false,
							caller: nextOutput.caller + '>buildRolesArrayResult',
							data: 'Password hash length too short'
						}
				        throw err;
				    }

				    var newApikeyResult = Dtcarrow.Password.newApikey();
				    if (!newApikeyResult.success || newApikeyResult.data.length < 32) {
						err.status = 422;
						err.success = false;
						err.caller += '>buildRolesArrayResult';
						err.data = 'Problems creating newApikey';
						throw err;
				    }

					user.password = randomPasswordResult.data;
					user.apikey = newApikeyResult.data;
					user.enabled = false;

					return createUser(user, next, resp);
				}
			})
			.then(function(createUserResult) {
				Dtcarrow.Common.nextSuccess(nextBase, createUserResult);
			})
			.done(null, function(err) {
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
}); 

// Internal functions
function createUser(newUser, next, resp) {
	var deferred = Q.defer();

	Dtcarrow.RoleRelationship.sanitizeRoles(newUser.roles)
		.then(function(sanitizeRolesResult) {
			newUser.roles = sanitizeRolesResult.data;
			return Dtcarrow.User.create(newUser)
		})
		.then(function(userCreateResult) {
			return Dtcarrow.AdminCoachPlayer.create(userCreateResult.data.id, newUser);
		})
		.then(function(acpCreateResult) {
			return Dtcarrow.RoleRelationship.create(acpCreateResult.data);
		})
		.then(function(rrCreateResult) {
			if (typeof rrCreateResult.data.apikey === 'undefined') {
				err.success = false;
				err.caller = 'user-post.js>createUser';
				err.status = 500;
				err.data = 'apikey missing after user creation';
				throw err;
			}

			var clientApikey = Dtcarrow.Api.encryptApikey(newUser.apikey, 24);
			if (typeof clientApikey.data === 'undefined' || clientApikey.data.length < 64) {
				err.success = false;
				err.caller = 'user-post.js>createUser';
				err.status = 500;
				err.data = 'encryptApikey returned an invalid clientApikey';
				throw err;
			}

			var subject = 'Welcome to Tipped Sports Recruiting!',
				body = '<html><h1>Welcome!</h1>'
					 + '<p>click <a href="' + Dtcarrow.Constants.BASEWEBURL + '#/user/activate?clientactivatekey=' + clientApikey.data 
					 + '">here</a> to activate your account!</p>';
			return Dtcarrow.Common.sendEmail(newUser.email, subject, body);
		})
		.then(function(sendEmailResult) {
			deferred.resolve({ success: true, status: 200, caller: 'user-post.js>createUser', 
				data: 'User created' });
		})
		.done(null, function(err) {
			deferred.reject({ success: false, status: 500, caller: 'user-post.js>createUser>fail', 
				data: err });
		});

	return deferred.promise;
}

module.exports = Module;       