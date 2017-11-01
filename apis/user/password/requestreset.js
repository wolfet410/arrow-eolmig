var Arrow = require('arrow'),
	Dtcarrow = require('dtcarrow'),
	Q = require('q');

var Module = Arrow.API.extend({
	group: 'user', 
	path: '/api/user/password/requestreset',
	method: 'POST',
	description: 'Sends email message with link to reset password',
	parameters: {
        email: { description: 'Email address' }
    },
	action: function (req, resp, next) {
		// TODO: Consider only allowing so many password change requests from a given IP; however I'm concerned 
		// this would affect universities or schools who share the same public IP.

		// TODO: Add a second query, like zip code, to double-check we have the right email address

		var nextBase = {
			next: next, 
			resp: resp 
		}
		var nextOutput = {
			caller: 'requestreset.js>action'
		}

		Dtcarrow.User.emailExists(req.params.email)
			.then(function(emailExistsResult) {
				// Bounce out with success if email address doesn't exist
				// Success to mask which email addresses are valid
				if (!emailExistsResult.data) {
					nextOutput.success = true;
					nextOutput.status = 204;
					nextOutput.data = 'Password reset request accepted';
					// Success to mask valid vs invalid email addresses
					Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
					Dtcarrow.Common.log('emailExists returned false for ' + req.params.email);
					throw { hideError: true }
				}

				handleResetRequest(req.params.email)
					.then(function(handleResetRequestResult) {
						if (handleResetRequestResult.success) {
							nextOutput.success = true;
							nextOutput.status = 204;
							nextOutput.caller += '>emailExistsResult>handleResetRequestResult'
							nextOutput.data = 'Password reset request accepted';
							Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
						} else {
							err.status = 422;
							err.data = 'POST failed with unknown error';
							throw err
						}
					})
					.done(null, function(err) {
						err.success = false;
						err.caller = nextOutput.caller + '>' + err.caller + '>emailExistsResult>handleResetRequestResult';
						Dtcarrow.Common.nextFail(nextBase, err);
					});
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>emailExistsResult>fail';
				if (!hideError) {
					err.success = false;
					Dtcarrow.Common.nextFail(nextBase, err);
				} else {
					err.success = true;
					Dtcarrow.Common.nextSuccess(nextBase, err);
				}
			});
	}
}); 
 
// Internal functions
function handleResetRequest(email) {
	var deferred = Q.defer();

	getUser(email)
		.then(function(getUserResult) {
			// Using the same clientApiKey concept to create a password reset key
			var resetkey = Dtcarrow.Password.newApikey();
			return updateResetkey(getUserResult.data, resetkey.data);
		})
		.then(function(updateResetKeyResult) {
			// Reset keys expire after 24 hours
			var clientResetkey = Dtcarrow.Api.encryptApikey(updateResetKeyResult.data.resetkey, 24);
			if (!clientResetkey.success || clientResetkey.data.length < 64) {
			 	deferred.reject({ success: false, status: 422, caller: 'handleResetRequest', 
			   		data: 'encryptApikey returned an invalid clientApikey' });
			 	return deferred.promise;
			}

			var body = 'Click this link to reset your password:'
					 + '<br><a href="' + Dtcarrow.Constants.BASEWEBURL + '#/user/fulfillpasswordreset?'
					 + 'clientresetkey=' + clientResetkey.data + '">Reset Your Password</a>';
			return Dtcarrow.Common.sendEmail(email, 'Resetting your TSR password', body)
		})
		.then(function(sendEmailResult) {
			if (sendEmailResult.success) {
				deferred.resolve({ success: true, status: 204, caller: 'requestreset.js>handleResetRequest>sendEmailResult', 
			   		data: true });
			} else {
			 	deferred.reject({ success: false, status: 422, caller: 'requestreset.js>handleResetRequest>sendEmailResult', 
			   		data: 'sendEmailResult does not report success' });
			 	return deferred.promise;
			}
		})
		.done(null, function(err) {
		 	deferred.reject({ success: false, status: 500, caller: 'requestreset.js>handleResetRequest>sendEmailResult>fail', 
		   		data: err });
		});

	return deferred.promise;
}

function getUser(email) {
	var deferred = Q.defer();

	if (typeof email === 'undefined') {
		deferred.reject({ success: false, status: 404, caller: 'requestreset.js>getUser', 
		   		data: 'Missing email' });
		return deferred.promise;
	}

	var	Model = Arrow.getModel('appc.mysql.eolmig/User');
	Model.query({ email: email }, function(err, user) {
		if (err) {
			deferred.reject({ success: false, status: 500, caller: 'requestreset.js>getUser>query', 
		   		data: err });
			return deferred.promise;
		}

		if (typeof user === 'undefined' || user.length < 1) {
			deferred.reject({ success: false, status: 404, caller: 'requestreset.js>getUser>query', 
		   		data: 'No user returned' });
			return deferred.promise;
		}

		deferred.resolve({ success: true, status: 200, caller: 'requestreset.js>getUser', 
			data: user[0] });
	});

	return deferred.promise;
}


function updateResetkey(user, resetkey) {
	var deferred = Q.defer();

	if (typeof user.userId === 'undefined') {
		deferred.reject({ success: false, status: 404, caller: 'requestreset.js>updateResetkey', 
		   		data: 'Missing userId' });
		return deferred.promise;
	}

	var	Model = Arrow.getModel('appc.mysql.eolmig/User');
	var query = 'UPDATE User SET resetkey = "' + resetkey + '" WHERE userId = ' + user.userId;
	Model.query({ customSqlQuery: query }, function(err, rs) {
		if (err) {
			deferred.reject({ success: false, status: 500, caller: 'requestreset.js>updateResetkey>query', 
		   		data: err });
			return deferred.promise;
		}

		// Adding the resetkey to the user object to simplify life
		user.resetkey = resetkey;
		deferred.resolve({ success: true, status: 200, caller: 'requestreset.js>updateResetkey', 
		   		data: user });
	});

	return deferred.promise;
}


module.exports = Module;
