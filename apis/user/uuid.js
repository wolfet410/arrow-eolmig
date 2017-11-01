var Arrow = require('arrow'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'user',
	path: '/api/user/uuid',
	method: 'GET',
	description: 'Simple UUID creator that we use as an apikey',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'uuid.js>action'
		}
		var newApikeyResult = Dtcarrow.Password.newApikey();
		if (!newApikeyResult.success || newApikeyResult.data.length < 32) {
			nextOutput.success = false;
			nextOutput.caller += 'newApikeyResult';
			nextOutput.status = 500;
			nextOutput.data = 'Problems creating UUID';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
		} else {
			nextOutput.success = true;
			nextOutput.caller += 'newApikeyResult';
			nextOutput.status = 200;
			nextOutput.data = { uuid: newApikeyResult.data };
			Dtcarrow.Common.nextSuccess(nextBase, nextOutput);
		}
	}
});

module.exports = Module;