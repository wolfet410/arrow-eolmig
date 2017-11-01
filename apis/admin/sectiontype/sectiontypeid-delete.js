var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/sectiontype/:sectionTypeId',
	method: 'DELETE',
	description: 'Deletes existing section type',
	parameters: {
		sectionTypeId: { description: 'sectionTypeId', type: 'path' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'sectiontypeid-delete.js>action'
		} 

		Dtcarrow.SectionType.delete(req.params)
			.done(function(deleteResult) {
				deleteResult.caller += '>deleteResult';
				Dtcarrow.Common.nextSuccess(nextBase, deleteResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module; 