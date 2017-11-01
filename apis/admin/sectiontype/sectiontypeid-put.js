var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/sectiontype/:sectionTypeId',
	method: 'PUT',
	description: 'Edits existing section type',
	parameters: {
		sectionTypeId: { description: 'sectionTypeId', type: 'path' },
		description: { description: 'Section Type Description' }
	},
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'sectiontypeid-put.js>action'
		}		
		var check = {
			description: 'string'
		}
		var checkedSectionType = Dtcarrow.Common.checkObject(req.params, check);
		if (!checkedSectionType) {
			nextOutput.status = 422;
			nextOutput.data = 'Inbound object does not match expectations!';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		Dtcarrow.SectionType.update(checkedSectionType)
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