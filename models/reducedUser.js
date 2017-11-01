var Arrow = require('arrow');

var Model = Arrow.Model.reduce('appc.mysql.eolmig/User','reducedUser',{
	fields: {
		userId: {
			type: 'number',
			required: false,
			optional: true,
			readonly: true,
			writeonly: false
		},
		email: {
			type: 'string',
			required: false,
			optional: true,
			readonly: false,
			writeonly: false
		},
		enabled: {
			type: 'string',
			required: false,
			optional: true,
			readonly: false,
			writeonly: false
		}
	},
	actions: [
		'read'
	],
	singular: 'reducedUser',
	plural: 'reducedUsers'
});


module.exports = Model;