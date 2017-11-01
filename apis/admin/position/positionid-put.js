var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/position/:positionId',
	method: 'PUT',
	description: 'Edits existing position',
	parameters: {
		positionId: { description: 'positionId', type: 'path' },
		description: { description: 'Position description' },
		sport: { description: 'Sport object: { sportId: Integer ID, description (Optional): Description }' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'positionid-put.js>action'
		}		
		var check = {
			description: 'string',
			sport: {
				sportId: 'string'
			}
		}
		var position = Dtcarrow.Common.checkObject(req.params, check);
		if (!position) {
			nextOutput.status = 422;
			nextOutput.data = 'Inbound object does not match expectations!';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		Dtcarrow.Position.update(position)
			.done(function(updateResult) {
				updateResult.caller += '>updateResult'
				Dtcarrow.Common.nextSuccess(nextBase, updateResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 