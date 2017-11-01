var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/position',
	method: 'POST',
	description: 'Creates new position',
	parameters: {
		description: { description: 'Position description' },
		sport: { 
			description: '{'
			+ '<br>&emsp;sportId: Integer ID'
			+ '<br>}' 
		}
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'position-post.js>action'
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

		Dtcarrow.Position.create(position)
			.done(function(createResult) {
				createResult.caller += '>createResult';
				Dtcarrow.Common.nextSuccess(nextBase, createResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;  