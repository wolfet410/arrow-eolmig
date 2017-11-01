var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/user',
	method: 'PUT',
	description: 'Edits authenticated user (coach or player)',
	parameters: {
		email: { description: 'Email address used as user ID' },
		firstName: { description: 'First name' },
		lastName: { description: 'Last name' },
		address: { description: 'Street address' },
		city: { description: 'City' },
		state: { description: 'Two character state abbreviation' },
		zip: { description: '5-digit zip code' },
		phone: { description: 'Phone number' },
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
		};

		var nextOutput = {
			caller: 'user-put.js>action'
		};

		var decryptResults = Dtcarrow.Api.decryptClientApikey(req.headers['x-api-key']);

		if (typeof decryptResults.data !== 'object') {
			// There was an error decrypting the client apikey, return the error message back to the callback
			nextOutput.success = false;
			nextOutput.status = 500;
			nextOutput.caller += '>decryptClientApikeyResult';
			nextOutput.data = decryptResults.data;
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		// Using getDetails to get the userId of the auth user, so we can ensure we are always
		// only modifying auth user
		var originalUserId;
		Dtcarrow.User.getDetails(req, decryptResults.data)
			.then(function(getDetailsResult) {
				originalUserId = getDetailsResult.data.userId;
				if (getDetailsResult.data.email === req.params.email) {
					// Email address hasn't changed, so we can just return .data = false to continue
					return { data: false };
				} else {
					// Email address is being changed, does the new one already exist?
					return Dtcarrow.User.emailExists(req.params.email);
				}
			})
			.then(function(emailExistsResult) {
				if (emailExistsResult.data === false) {
					// TODO: Handle email address change!
					var user = req.params;
					user.userId = originalUserId;
					return Dtcarrow.AdminCoachPlayer.update(user);
				} else {
					throw { success: false, status: 409, caller: nextOutput.caller + '>emailExistsResult', 
						data: 'New email address already exists' };
				}
			})
			.done(function(updateResult) {
				Dtcarrow.Common.nextSuccess(nextBase, updateResult);
			}, function(err) {
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
}); 
 
module.exports = Module;   