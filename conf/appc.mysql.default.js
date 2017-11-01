module.exports = {
	connectors: {
		'appc.mysql.eolmig': {
			connector: 'appc.mysql',
			connectionPooling: true,
			connectionLimit: 10,

			database: 'eolmig',
			user: 'root',
			password: '1-myseaquellroot',
			host: 'localhost',
			port: 3306,

			generateModelsFromSchema: true,
			modelAutogen: true
		}
	}
};
