var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/statistic',
	method: 'POST',
	description: 'Creates new statistic',
	parameters: {
		description: { description: 'statistic description' },
		sport: { 
			description: '{'
			+ '<br>&emsp;sportId: Integer ID'
			+ '<br>}' 
		},
		measurement: { description: '{'
			+ '<br>&emsp;measurementId: Integer ID'
			+ '<br>}'
		},
		lower: { description: 'Lower boundary of statistic as MySQL decimal 10,5'},
		upper: { description: 'Upper boundary of statistic as MySQL decimal 10,5'}

	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'statistic-post.js>action'
		}

		var check = {
			description: 'string',
			sport: {
				sportId: 'string'
			}
		}
		var statistic = Dtcarrow.Common.checkObject(req.params, check);
		if (!statistic) {
			nextOutput.status = 422;
			nextOutput.data = 'Inbound object does not match expectations!';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		Dtcarrow.Statistic.create(statistic)
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