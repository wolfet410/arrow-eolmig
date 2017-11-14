var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/account/setext2',
	method: 'PUT',
	description: 'Update setext2 task for given dn and status',
	parameters: {
        dn: { description: 'Distinguished Name' },
        status: { description: 'Status' }
    },

	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'setext2-put.js>action'
		}

		twarrow.Account.updateSetext2(req.params.dn, req.params.status)
			.then(function(result) {
				twarrow.Common.nextSuccess(nextBase, result);
			})
			.done(null, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				twarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;