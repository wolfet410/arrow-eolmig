var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/position/:positionId',
	method: 'GET',
	description: 'Get a single position\'s information',
	parameters: {
		positionId: { description: 'positionId value', type: 'path' }
	},
	singular: 'position',
	plural: 'positions',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'positionid-get.js>action'
		}

		Dtcarrow.Position.read(req.params.positionId)
			.done(function(readResult) {
				readResult.caller += '>readResult';
				Dtcarrow.Common.nextSuccess(nextBase, readResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 