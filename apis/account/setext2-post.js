var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/account/setext2',
	method: 'POST',
	description: 'Create setext2 task',
	parameters: {
        dn: { description: 'Distinguished name' }
    },
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'setext2-post.js>action'
		}

		twarrow.Account.createSetext2(req.params.dn)
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