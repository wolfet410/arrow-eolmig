var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');	

var Module = Arrow.API.extend({
	group: 'admin',
	path: '/api/admin/sectiontype',
	method: 'GET',
	description: 'Get all section types',
	plural: 'sectiontypes',
	singular: 'sectiontypes',
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp
		}
		var nextOutput = {
			caller: 'sectiontype-get.js>action'
		}
 		Dtcarrow.SectionType.readAll()
			.done(function(readAllResult) {
				readAllResult.caller += '>readAllResult';
				Dtcarrow.Common.nextSuccess(nextBase, readAllResult);
			}, function(err) {
				err.caller = nextOutput.caller + '>' + err.caller + '>fail';
				Dtcarrow.Common.nextFail(nextBase, err);
			});
	}
});

module.exports = Module;    