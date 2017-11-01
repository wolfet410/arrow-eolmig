var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/user',
	method: 'GET',
	description: 'Get list of users',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'user-get.js>action'
		}

		Dtcarrow.User.readAll()
			.then(function(readAllResult) {
				var promises = [];
				readAllResult.data.forEach(function(user) {
					promises.push(Dtcarrow.RoleRelationship.read(user));
				});
				
				return Q.all(promises);
			})
			.then(function(promisesResult) {
				var outputs = [];
				promisesResult.forEach(function(p) {
					outputs.push(p.data);
				});

				nextOutput.status = 200;
				nextOutput.caller += '>promisesResult'
				nextOutput.data = outputs;
				Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;