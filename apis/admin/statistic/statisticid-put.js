var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/statistic/:statisticId',
	method: 'PUT',
	description: 'Edits existing statistic',
	parameters: {
		statisticId: { description: 'statisticId', type: 'path' },
		description: { description: 'Statistic description' },
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
			caller: 'statisticid-put.js>action'
		}		

		var check = {
			description: 'string',
			lower: 'string',
			upper: 'string',
			sport: {
				sportId: 'string'
			},
			measurement: {
				measurementId: 'string'
			}
		}
		var statistic = Dtcarrow.Common.checkObject(req.params, check);
		if (!statistic) {
			nextOutput.status = 422;
			nextOutput.data = 'Inbound object does not match expectations!';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		Dtcarrow.Statistic.update(statistic)
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