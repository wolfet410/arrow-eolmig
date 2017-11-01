var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/sectiontype/:sectionTypeId',
	method: 'GET',
	description: 'Get a single section type\'s information',
	parameters: {
		sectionTypeId: { description: 'sectionTypeId', type: 'path' }
	},
	singular: 'sectiontype',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'sectiontypeid-get.js>action'
		}

		Dtcarrow.SectionType.read(req.params.sectionTypeId)
			.done(function(readResult) {
				readResult.caller += '>readResult';
				Dtcarrow.Common.nextSuccess(nextBase, readResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});  
 
module.exports = Module; 