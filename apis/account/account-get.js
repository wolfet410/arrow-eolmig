var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/account/account',
	method: 'GET',
	description: 'Get list of accounts',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'account-get.js>action'
		}

		// This will ultimately need to read the filter from a 
		// 1:many DN to user account association in the database;
		// however for this PoC we will just hard code it
		dnFilter = 'OU=Information Technology,OU=AUB,DC=sinter,DC=gkn,DC=com';

		twarrow.Account.readAll(dnFilter)
			.then(function(readAllResult) {
				twarrow.Common.nextSuccess(nextBase, readAllResult);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				twarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;