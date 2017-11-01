var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/user/:userId',
	method: 'GET',
	description: 'Get a single user\'s information',
	parameters: {
		userId: { description: 'userId value', type: 'path' }
	},
	singular: 'user',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'userid-get.js>action'
		}

		Dtcarrow.User.read (req.params.userId)
			.then(function(userReadResult) {
				return Dtcarrow.RoleRelationship.read(userReadResult.data[0]);
			})
			.then(function(rrReadResult) {
				return Dtcarrow.AdminCoachPlayer.read(rrReadResult.data);
			}) 
			.then(function(acpReadResult) {
				acpReadResult.caller += '>acpReadResult';
				Dtcarrow.Common.nextSuccess(nextBase, acpReadResult);
			})
			.fail(function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module;            