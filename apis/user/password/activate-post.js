var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow'); 

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/password/activate',
	method: 'POST',
	description: 'Activates account by enabling it and setting user password',
	parameters: {
		email: { description: 'Email address used as user ID' },
		clientactivatekey: { description: 'Original (encrypted) clientactivatekey' },
		newpassword: { description: 'New password chosen by the user' }
	},
	action: function (req, resp, next) {
		// Pull the apikey out of the clientactivatekey
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'activate-post.js>action'
		}

		var activatekeyobject = twarrow.Api.decryptClientApikey(req.params.clientactivatekey);

		if (!activatekeyobject.success) {
			activatekeyobject.caller = nextOutput.caller + '>' + activatekeyobject.caller;
			twarrow.Common.nextFail(nextBase, activatekeyobject);
			return;
		}

		if (!twarrow.Api.testExpiration(activatekeyobject.data.expiration)) {
			nextOutput.status = 422;
			nextOutput.data = 'clientactivatekey has expired';
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		// Get user object via email address and activatekey
		var Model = Arrow.getModel('appc.mysql.eolmig/User');
		var query = 'SELECT * FROM User WHERE apikey = "' + activatekeyobject.data.apikey + '" AND email = "' + req.params.email + '"';
		Model.query({ customSqlQuery: query }, function(err, results) {
			if (err) {
				nextOutput.status = 500;
				nextOutput.caller += '>query';
				nextOutput.data = err;
				twarrow.Common.nextFail(nextBase, nextOutput);
				return;
			}

			if (typeof results !== 'undefined' && results.length > 0) {
				var user = results[0];
				twarrow.Password.updatePassword(user.userId, req.params.newpassword)
					.then(function(updatePasswordResult) {
console.warn('1');
console.warn(updatePasswordResult);
						if (updatePasswordResult.success) {
							// Enable the account
							user.enabled = true;
							return twarrow.User.update(user);
						} else {
							var err = {
								status: 422,
								caller: '>updatePasswordResult',
								data: 'updatePasswordResult does not report success'
							};
							throw err;
						}
					})
					.then(function(userUpdateResult) {
console.warn('2');
console.warn(userUpdateResult);
						if (userUpdateResult.success) {
							nextOutput.status = 200;
							nextOutput.caller += '>userUpdateResult';
							nextOutput.data = 'Password change successful';
							twarrow.Common.nextSuccess(nextBase, nextOutput);
						} else {
							userUpdateResult.caller += '>userUpdateResult';
							throw userUpdateResult;
						}
					})
					.done(null, function(err) {
console.warn('3');
console.warn(err);
						err.caller = nextOutput.caller + '>' + err.caller + '>fail';
						twarrow.Common.nextFail(nextBase, err);
					});
			} else {
				nextOutput.status = 422;
				nextOutput.caller += '>queryresults';
				nextOutput.data = 'Could not find the user associated with the given activatekey';
				twarrow.Common.warn(nextOutput.caller + ':Could not find the user associated with the given activatekey');
				twarrow.Common.nextFail(nextBase, nextOutput);
			}
		});
	}
});

module.exports = Module; 
