var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/password/change',
	method: 'POST',
	description: 'Changes user password',
	parameters: {
		email: { description: 'Email address used as user ID' },
		oldpassword: { description: 'Users old password' },
		newpassword: { description: 'New password chosen by the user' }
	},
	action: function (req, resp, next) {
		// This API is secured by the standard role-based security checks, 
		// so the x-api-key (clientApikey) header will be verified valid before 
		// we get here

		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'activate-post.js>action'
		}

		// Get the apikey of the email & (old) password combo entered into the change password
		// form
		var passwordAuthResult = Dtcarrow.Password.authenticate(req.params.email, req.params.oldpassword);

		// Pull the apikey out of the clientApikey in the x-api-key header
		var decryptClientApikeyResult = Dtcarrow.Api.decryptClientApikey(req.headers['x-api-key']);

		Q.spread([passwordAuthResult, decryptClientApikeyResult], function(passwordAuthResult, decryptClientApikeyResult) {
			if (!passwordAuthResult.success || typeof passwordAuthResult.data[0].apikey === 'undefined') {
				throw passwordAuthResult;
			}

			var user = passwordAuthResult.data[0];
			if (user.apikey === decryptClientApikeyResult.data.apikey) {
				Dtcarrow.Password.updatePassword(user.userId, req.params.newpassword)
					.then(function(updatePasswordResult) {
						nextOutput.status = 200;
						nextOutput.caller += 'updatePasswordResult';
						nextOutput.data = 'Password change successful';
						nextOutput.success = true;
						Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
					})
					.fail(function(err) {
						err.caller = nextOutput.caller + '>' + err.caller + '>updatePasswordResult';
						Dtcarrow.Common.nextFail(nextBase, err);
					});
			} else {
				err = {
					status: 422,
					caller: 'updatePasswordResult',
					data: 'There is an apikey mismatch, the password cannot be changed',
					success: false
				}
				throw err;
			}
		})
		.done(null, function(err) {
			err.caller = nextOutput.caller + '>' + err.caller + '>fail';
			Dtcarrow.Common.nextFail(nextBase, err);
		});
	}
});

module.exports = Module;
