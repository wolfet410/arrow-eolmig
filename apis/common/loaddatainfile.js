var Arrow = require('arrow'),
	Q = require('q'),
    fs = require('fs');


var Module = Arrow.API.extend({
	group: 'common',
	path: '/api/common/loaddatainfile/:table',
	method: 'POST',
	description: 'Retrieves data from a file <strong>already stored on the local server</strong>'
				+ ' and adds it to the specified MySQL table.'
				+ '<br>Note this breaks REST standards; however the work required to get Arrow'
				+ 'to pull data from a file stream will take too long.'
				+ '<br>Major security implications, this API should only be available'
				+ 'to the Administrator role (so it can be used by internalapi@gkn.com)!',
	parameters: {
		filepath: { description: 'Path to LOCAL file on the server, if using a relative path it is relative to arrow-eolmig', type: 'body' },
		table: { description: 'Table name', type: 'path' },
		fields: { description: 'List of fields in text in format (column1, column2, column3)', type: 'body' },
		truncate: { description: 'Truncate table before load, accepts true or false, default false', optional: true, type: 'body' }
	},
	action: function (req, resp, callback) {
		var Model = Arrow.getModel('appc.mysql.eolmig/' + req.params.table);
		var query = '';

		if (typeof Model === 'undefined') {
			callback('loaddatainfile.js, Invalid table: ' + req.params.table);
			return;
		}
		if (req.params.truncate === 'true') {
			query = 'TRUNCATE ' + req.params.table;
			Model.query({ customSqlQuery: query },
				function(err) { 
					if (err) {
						callback('loaddatainfile.js, Error in TRUNCATE: ' + err);
						return;
					}

					loadData(req.params)
						.then(function() {
							callback(null, true);
						})
						.fail(function(err) {
							callback(err);
						});
				}
			);
		} else {
			loadData(req.params)
				.then(function() {
					callback(null, true);
				})
				.fail(function(err) {
					callback(err);
				});
		}
	}
});

// Internal functions
function loadData(params) {
	var deferred = Q.defer();

	var Model = Arrow.getModel('appc.mysql.eolmig/' + params.table);
	var query = 'LOAD DATA LOCAL INFILE "' + params.filepath
			+ '" INTO TABLE ' + params.table
			+ ' FIELDS TERMINATED BY ","'
			+ ' OPTIONALLY ENCLOSED BY \'"\' '
			+ ' LINES TERMINATED BY "\n"'
			+ ' IGNORE 2 LINES'
			+ ' ' + params.fields;

	Model.query({ customSqlQuery: query },
		function(err) { 
			if (err) {
				deferred.reject('loaddatainfile.js, POST: ' + err);
				return deferred.promise;
			}
			
			deferred.resolve(true);
		}
	);

	return deferred.promise;
}

module.exports = Module;