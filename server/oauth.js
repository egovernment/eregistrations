"use strict";

var debug          = require('debug-ext')('oauth')
  , mano           = require('mano')
  , userEmailMap   = require('mano/lib/server/user-email-map')
  , login          = require('mano-auth/server/authentication').login
  , loadToMemoryDb = require('mano/lib/server/resolve-user-access')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , generateUnique = require('time-uuid')
  , request        = require('request')
  , jwtDecode      = require('jwt-decode')
  , env            = mano.env
  , userStorage    = mano.dbDriver.getStorage('user');

var dbjsDataRecord = function (id, value) {
	return { id: id, data: { value: serializeValue(value) } };
};

module.exports = exports = {
	logoutMiddleware: function (req, res, next) {
		// It's passthru middleware
		next();

		if (req._parsedUrl.pathname !== '/logout/') return;

		var accessToken = res.cookies.get('oAuthToken');

		if (!accessToken) return;

		request({
			uri: env.oauth.invalidationEndpoint,
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + accessToken
			}
		}, function (error, response, body) {
			if (error) {
				debug('Error received from invalidation endpoint:', error);
			}
		});
	},
	loginMiddleware: function (req, res, next) {
		if (req._parsedUrl.pathname !== '/oauth-login/') {
			next();
			return;
		}

		// Filter out logged in users.
		if (req.$user) {
			// That are not demo accounts.
			var demoUserId      = res.cookies.get('demoUser')
			  , isDifferentUser = demoUserId !== req.$user;

			if (!demoUserId || isDifferentUser) {
				next();
				return;
			}
		}

		var state = generateUnique();
		res.cookies.set('OAuthState', state);

		// Redirect user to CAS.
		debug('Login request. Unique state:', state);

		res.writeHead(302, {
			Location: env.oauth.authorizationEndpoint + '?'
				+ 'response_type=code&'
				+ 'client_id=' + encodeURIComponent(env.oauth.clientId) + '&'
				+ 'state=' + encodeURIComponent(state) + '&'
				+ 'scope=MiEmpresa&'
				+ 'redirect_uri=' + encodeURIComponent(env.oauth.redirectUrl)
		});
		res.end();
	},
	callbackMiddleware: function (req, res, next) {
		var query = req.query;

		if (req._parsedUrl.pathname !== '/eid-callback') {
			next();
			return;
		}

		debug('Callback received. Query:', query);

		if (query.error) {
			// TODO: How should we notify the user about the error? Flash message?
			res.writeHead(302, { Location: '/' });
			res.end();

			return;
		}

		var state = req.cookies.get('OAuthState');

		// Clear state as it's supposed to be one time only.
		res.cookies.set('OAuthState', null);

		if (state !== query.state) {
			debug('State value did not match:', state, query.state);

			// TODO: Notify user.
			res.writeHead(302, { Location: '/' });
			res.end();

			return;
		}

		debug('States match');

		request({
			uri: env.oauth.tokenEndpoint,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: 'Basic ' + new Buffer(env.oauth.clientId + ':'
					+ env.oauth.clientSecret).toString('base64')
			},
			form: {
				grant_type: 'authorization_code',
				code: query.code,
				redirect_uri: env.oauth.redirectUrl
			}
		}, function (error, response, body) {
			if (error) {
				debug('Error received from token endpoint:', error);

				// TODO: Notify user.
				res.writeHead(302, { Location: '/' });
				res.end();
			} else if (response.statusCode >= 200 && response.statusCode < 300) {
				var parsedBody  = JSON.parse(body)
				  , accessToken = parsedBody.access_token
				  , decoded     = jwtDecode(accessToken);

				debug('JWT received for:', decoded.email);

				userEmailMap(function (map) {
					return map.get(serializeValue(decoded.email));
				})(function (userId) {
					console.log('ALL I HAVE', decoded);
					if (userId) return userId;

					var isPublicApp = req.$appName === 'public'
					  , demoUserId  = isPublicApp ? null : res.cookies.get('demoUser')
					  , records     = []
					  , roles = ['user']
					  , isNotary;

					isNotary = decoded && decoded.ids && decoded.ids.some(function (item) {
						return item.key === "PROFESSIONAL_ACCOUNT_TYPE" && item.value === 'notaryType';
					});
					if (isNotary) {
						roles.push('manager');
					}

					if (!demoUserId) {
						return mano.queryMemoryDb([], 'addUser', JSON.stringify({
							firstName: decoded.fname,
							lastName: decoded.lname,
							email: decoded.email,
							roles: roles
						}));
					}

					userId = demoUserId;

					records.push(dbjsDataRecord(userId + '/isDemo', undefined));
					records.push(dbjsDataRecord(userId + '/firstName', decoded.fname));
					records.push(dbjsDataRecord(userId + '/lastName', decoded.lname));
					records.push(dbjsDataRecord(userId + '/email', decoded.email));

					return userStorage.storeMany(records)(function () {
						return loadToMemoryDb([userId]);
					})(function () {
						return userId;
					});
				}).done(function (userId) {
					if (!decoded.email_verified) {
						res.writeHead(302, { Location: '/request-confirm-account/' });
						res.end();
						return;
					}

					res.cookies.set('oAuthToken', accessToken);

					login(userId, req, res);

					res.writeHead(303, {
						Location: '/',
						Authorization: 'Bearer ' + accessToken
					});
					res.end();
				});
			} else {
				debug('Failed to authorize:', response.statusCode);

				// TODO: Notify user.
				res.writeHead(302, { Location: '/' });
				res.end();
			}
		});
	}
};
