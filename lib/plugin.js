var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');

function Plugin(server) {
 	// Constructor to get a reference to the config object
 	this.config = server.config;
}

Plugin.prototype.matchURL = function(req) {
	// All URLs are processed
	return true; 	

	// return false to test APIs without any security
	// return false;
};
 
Plugin.prototype.validateRequest = function(req, resp, next) {
	// Validate the API request
	var nextBase = {
		next: next, 
		resp: resp
	}
	var nextOutput = {
		caller: 'plugin.js>validateRequest'
	}

	// Query the Api table for the APIs ID by its relative path
	// Split quickly ensures we ignore any potential GET parameters
	var path = req.url.split('?')[0];
	var api = twarrow.Api.getApiDetails(path, req.method)
		.then(function(getApiDetailsResult) {
			return twarrow.Api.getApiRoles(getApiDetailsResult);
		})
		.fail(function(err) {
			// Handling the failure in Q.all
			return err;
		});

	var user = twarrow.Api.getUserDetails(req)
		.fail(function(err) {
			// Handling the failure in Q.all
			return err;
		});

	Q.all([api, user]).spread(function(apidetails, userdetails) {
		// Check if the roles match, if there are no roles or the API is not secured
		// there will not be any roles to check
		if (apidetails.success !== true) {
			// something is drastically wrong, send the error & unauthorized to the caller
			twarrow.Common.warn('apidetails: ' + apidetails);
			nextOutput.status = 401;
			nextOutput.caller += '>Q.all>apidetails>' + apidetails.caller;
			nextOutput.data = apidetails.data;
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		if (typeof apidetails.data.secured !== 'undefined' && apidetails.data.secured === 'false') {
			// We do not need to look at roles of APIs that are not secured, send authorized to the caller
			// We are doing this before checking user credentials by design
			nextOutput.status = 204;
			nextOutput.caller += '>Q.all>apidetails' + apidetails.caller;
			nextOutput.data = true;
			twarrow.Common.nextSuccess(nextBase, nextOutput);
			return;
		} 

		if (typeof apidetails.data.roles === 'undefined' || apidetails.data.roles.length === 0) {
			nextOutput.status = 401;
			nextOutput.caller += '>Q.all>apidetails' + apidetails.caller;
			nextOutput.data = 'API ' + apidetails.data.url + ' is secured but does not have any roles assigned to it';

			twarrow.Common.warn(nextOutput.data);
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		if (userdetails.success !== true) {
			// userdetails is not an object and the api is secured, 
			// yet the user is not be logged in or something else went wrong, 
			// so send the error & unathorized to the caller
			nextOutput.status = 401;
			nextOutput.caller += '>Q.all>apidetails' + userdetails.caller;
			nextOutput.data = userdetails.data;
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		var testExpirationResult = twarrow.Api.testExpiration(userdetails.data.result.expiration);
		if (testExpirationResult.data !== true) {
			nextOutput.status = 401;
			nextOutput.caller += '>Q.all>apidetails' + testExpirationResult.caller;
			nextOutput.data = 'clientapikey has expired';
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}
		// Checking for disabled user
		if (userdetails.data.result.enabled !== 'true' && userdetails.data.result.enabled !== true) {
			twarrow.Common.log('userId ' + userdetails.result.userId + ' is disabled!');
			nextOutput.status = 403;
			nextOutput.data = 'userId ' + userdetails.result.userId + ' is disabled!';
			twarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		var userroles = [];
		var apiroles = [];
		userdetails.data.result.roles.forEach(function(role) {
			userroles.push(role.roleId);
		});
		apidetails.data.roles.forEach(function(role) {
			apiroles.push(role.roleId);
		});
		var match = twarrow.Common.arrayValueMatch(userroles, apiroles);

		if (match) {
			nextOutput.status = 204;
			nextOutput.data = true;
			twarrow.Common.nextSuccess(nextBase, nextOutput);
		} else {
			nextOutput.status = 401;
			nextOutput.data = 'User roles and Api roles do not match!';
			twarrow.Common.nextFail(nextBase, nextOutput);
		}
	})
	.fail(function(err) {
		twarrow.Common.warn('Q.all spread failure!');
		twarrow.Common.warn(err);
		twarrow.Common.nextFail(nextBase, err);
	});

	return;
}

Plugin.prototype.applyCredentialsForTest = function(options) {
  // Support internal requests, e.g. from the admin console
};

Plugin.prototype.applyResponseForTest = function(resp, body) {
  // Support internal requests, e.g. from the admin console
};

module.exports = Plugin;