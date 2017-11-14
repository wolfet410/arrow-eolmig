var Arrow = require('arrow'),
	Q = require('q'),
	twarrow = require('twarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/task/task',
	method: 'POST',
	description: 'Create a task',
	parameters: {
        scriptName: { description: 'Name of script' },
        createdBy: { description: 'userId' }, // insecure auditing, easier than pulling userId from current user all over again
        parameter1: { description: 'parameter1' },
        parameter2: { description: 'parameter2' },
        parameter3: { description: 'parameter3' }
    },
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'setext2-post.js>action'
		}

		var task = {
			scriptName: req.params.scriptName,
			createdBy: req.params.createdBy,
			parameter1: req.params.parameter1,
			parameter2: req.params.parameter2,
			parameter3: req.params.parameter3
		};

		twarrow.Task.create(task)
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