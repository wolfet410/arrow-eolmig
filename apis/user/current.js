var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/current',
	method: 'GET',
	description: 'Get current user details, by API key',
	model: 'reducedUser',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'current.js>action'
		}

		var clientapikey = typeof req.params.clientapikey !== 'undefined' ? req.params.clientapikey : req.headers['x-api-key'];
		if (typeof clientapikey === 'undefined') {
			nextOutput.status = 403;
			nextOutput.data = 'Missing clientapikey, user is likely not logged in';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}
		
		var decryptResults = Dtcarrow.Api.decryptClientApikey(clientapikey);
		if (decryptResults.success !== true) {
			// There was an error decrypting the client apikey, return the error message back to the callback
			Dtcarrow.Common.nextFail(nextBase, decryptResults);
			return;
		}

		Dtcarrow.User.getDetails(req, decryptResults.data)
			.then(function(getDetailsResult) {
				return addRoles(getDetailsResult.data);
			})
			.then(function(addRolesResult) {
				// Add the expiration to the user 
				addRolesResult.data.expiration = decryptResults.data.expiration;

				nextOutput.status = 200;
				nextOutput.data = addRolesResult.data;

				Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
				return;
			})
			.done(null, function(err) {
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});
  
// Internal functions 
function addRoles(details) {
	var deferred = Q.defer();

	var	userroleModel = Arrow.getModel('appc.mysql.eolmig/UserRole');

	if (typeof details.userId === 'undefined') {
		deferred.reject({ success: false, status: 422, caller: 'user.js>addRoles', data: 'userId is undefined' });
		return deferred.promise;
	}

	userroleModel.query({ userId: details.userId }, function(err, userroleresults) {
		if (err) {
			deferred.reject({ success: false, status: 500, caller: 'user.js>addRoles', data: err });
			return deferred.promise;
		}

		if (typeof userroleresults === 'undefined' || userroleresults.length === 0) {
			// Users must have at least one role assigned to them
			deferred.reject({ success: false, status: 422, caller: 'user.js>addRoles', data: 'No roles assigned to the current user' });
			return deferred.promise;
		}

		details.roles = userroleresults;

		deferred.resolve({ success: true, status: 200, caller: 'user.js>addRoles', data: details });

	});

	return deferred.promise;
}

module.exports = Module;