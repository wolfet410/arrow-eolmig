var Arrow = require('arrow'),
	Q = require('q'),
	Dtcarrow = require('dtcarrow');

var login = Arrow.API.extend({
	group: 'user',
	path: '/api/user/login',
	method: 'POST',
	description: 'Login, generate api key (if required), and return it to the caller',
	model: 'appc.mysql.eolmig/User',
	parameters: {
        email: { description: 'Email address used as user ID' },
        password: { description: 'Password' }
    },
	action: function (req, resp, next) {
		var nextBase = {
			next: next, 
			resp: resp 
		}
		var nextOutput = {
			caller: 'login.js>action'
		}

		if (typeof req.params.email === 'undefined' || req.params.email.length < 3 || 
			typeof req.params.password === 'undefined' || req.params.password.length < 6) {
			
			nextOutput.status = 422;
			nextOutput.data = 'Empty or not enough characters in email or password';
			Dtcarrow.Common.nextFail(nextBase, nextOutput);
			return;
		}

		var clientApikey;
		Dtcarrow.Password.authenticate(req.params.email, req.params.password)
			.then(function(authenticateResult) {
			 	clientApikey = Dtcarrow.Api.encryptApikey(authenticateResult.data[0].apikey, 12);

				if (typeof clientApikey === 'undefined' || clientApikey.length < 64) {
					throw { success: false, status: 500, caller: nextOutput.caller + '>authenticateResult', 
						data: 'encryptApikey returned an invalid clientApikey' }
				}

				// Verifying profile pre-req's have been met
				req.headers['x-api-key'] = clientApikey.data;
				return Dtcarrow.Api.getPlayerCoachId(req, 'unknown');
			})
			.then(function(getPlayerCoachIdResults) {
				var deferred = Q.defer();
				if (getPlayerCoachIdResults.data.type === 'player') {
						var playerId = getPlayerCoachIdResults.data.id;
						requiredStatsPopulated(playerId)
							.then(function(requiredStatsPopulatedResult) {
								Dtcarrow.Common.nextSuccess(nextBase, { success: true, status: 200, caller: 'login.js>action',
									data: { clientapikey: clientApikey.data, requiredStatsPopulated: requiredStatsPopulatedResult.data } });
								return;
							})
							.done(null, function(err) {
								throw err;
							});
				} else {
					Dtcarrow.Common.nextSuccess(nextBase, { success: true, status: 200, caller: 'login.js>action',
						data: { clientapikey: clientApikey.data } });
					return;
				}
			})
			.done(null, function(err) {
				Dtcarrow.Common.nextFail(nextBase, err);
			});

		return;
	}
});

// Internal functions
function requiredStatsPopulated(playerId) {
	// Returns data.true if player stats are populated, data.false if they are not
	var deferred = Q.defer();

	// Parse stats for required === true
	var statisticReadAllResult;
	Dtcarrow.Statistic.readAll(true)
		.then(function(readAllResult) {
			statisticReadAllResult = readAllResult; // Storing for parsing later
			return Dtcarrow.Player.read(playerId);
		})
		.then(function(playerReadResult) {
			deferred.resolve({ success: true, status: 200, caller: '>requiredStatsPopulated', data: playerReadResult.data });
		})
		.done(null, function(err) {
			deferred.reject({ success: false, status: 422, caller: '>requiredStatsPopulated', data: err });
		});

	return deferred.promise;
}
  
module.exports = login;