var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow'); 

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/password/fulfillreset',
	method: 'POST',
	description: 'Resets user password via request and fulfill process',
	parameters: {
		email: { description: 'Email address used as user ID' },
		clientresetkey: { description: 'Original (encrypted) clientresetkey' },
		newpassword: { description: 'New password chosen by the user' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'fulfillreset-post.js>action'
		}

		// Pull the apikey out of the clientResetkey
		var decryptClientApikeyResult = twarrow.Api.decryptClientApikey(req.params.clientresetkey);

		if (!decryptClientApikeyResult.success) {
			nextOutput.status = 500;
			nextOutput.success = false;
			nextOutput.caller += '>decryptClientApikeyResult';
			nextOutput.data = 'Problems decrypting clientApikey';
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		if (!twarrow.Api.testExpiration(decryptClientApikeyResult.data.expiration)) {
			nextOutput.status = 401;
			nextOutput.success = false;
			nextOutput.caller += '>testExpirationResult';
			nextOutput.data = 'clientresetkey has expired';
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		// Get user object via email address and resetkey
		var Model = Arrow.getModel('appc.mysql.eolmig/User');
		var query = 'SELECT userId, email FROM User WHERE resetkey = "' + decryptClientApikeyResult.data.apikey + '" AND email = "' + req.params.email + '"';
		Model.query({ customSqlQuery: query }, function(err, user) {
			if (err) {
				deferred.reject({ success: false, status: 500, caller: nextOutput.caller + '>query', data: err });
				return deferred.promise;
			}

			if (typeof user !== 'undefined' && user.length > 0) {
				// Good user, update password
				twarrow.Password.updatePassword(user[0].userId, req.params.newpassword)
					.then(function(updatePasswordResult) {
						nextOutput.status = 200;
						nextOutput.success = true;
						nextOutput.caller += '>updatePasswordResult';
						nextOutput.data = 'Password change successful';
						twarrow.Common.nextSuccess(nextBase, nextOutput);
					})
					.done(null, function(err) {
						err.caller = nextOutput.caller + '>' + err.caller + '>fail';
						twarrow.Common.nextFail(nextBase, err);
					});
			} else {
				twarrow.Common.warn('fulfillreset-post.js, could not find the user associated with the given resetkey');
				nextOutput.status = 401;
				nextOutput.success = false;
				nextOutput.data = 'Could not find the user associated with the given resetkey';
				twarrow.Common.nextFail(nextBase, nextOutput);
			}
		});
	}
});

module.exports = Module;
