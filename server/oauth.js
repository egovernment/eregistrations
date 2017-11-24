"use strict";

var debug          = require('debug-ext')('oauth')
  , mano           = require('mano')
  , assign         = require('es5-ext/object/assign')
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

var createUser = function (data) {
	return mano.queryMemoryDb([], 'addUser', JSON.stringify(data));
};

var updateUser = function (userId, data) {
	var records = [];

	Object.keys(data).forEach(function (key) {
		records.push(dbjsDataRecord(userId + '/' + key, data[key]));
	});

	return userStorage.storeMany(records)(function () {
		return loadToMemoryDb([userId]);
	})(function () {
		return userId;
	});
};

var generateUrl = function (path, query) {
	var keys = Object.keys(query);

	keys.forEach(function (key, index) {
		if (index === 0) path += '?';

		path += key + '=' + encodeURIComponent(query[key]);

		if (index !== (keys.length - 1)) path += '&';
	});

	return path;
};

module.exports = exports = {
	loginMiddleware: function (req, res, next) {
		// 1. If not proper path, end.
		if (req._parsedUrl.pathname !== '/oauth-login/') {
			next();
			return;
		}

		// 2. Is there a user logged in?
		if (req.$user) {
			var demoUserId      = res.cookies.get('demoUser')
			  , isDifferentUser = demoUserId !== req.$user;

			// 2.1. If he is not current demo user, end.
			if (!demoUserId || isDifferentUser) {
				next();
				return;
			}
		}

		// 3. Generate and store unique state.
		var state = generateUnique();
		res.cookies.set('OAuthState', state);

		debug('Login request. Unique state:', state);

		// 4. Build redirect query.
		var locationQuery = assign({}, req.query, {
			response_type: 'code',
			client_id: env.oauth.clientId,
			state: state,
			scope: env.oauth.scope,
			redirect_uri: env.oauth.redirectUrl
		});

		if (env.oauth.extraAuthorizationParameters) {
			assign(locationQuery, env.oauth.extraAuthorizationParameters);
		}

		// 5. Redirect user to authorization endpoint.
		res.writeHead(302, {
			Location: generateUrl(env.oauth.authorizationEndpoint, locationQuery)
		});
		res.end();
	},
	logoutMiddleware: function (req, res, next) {
		var isLogoutPath = req._parsedUrl.pathname === '/logout/'
		  , accessToken  = res.cookies.get('oAuthToken');

		// 1. If proper path and token is set.
		if (isLogoutPath && accessToken) {
			debug('Invalidating token');

			// 1.1. Clean the tokens from cookie.
			res.cookies.set('oAuthToken', null);
			res.cookies.set('oAuthRefreshToken', null);

			// 1.2. Invalidate the token in CAS.
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
		}

		// 2. Passthru to other middlewares.
		next();
	},
	refreshMiddleware: function (req, res, next) {
		var accessToken  = res.cookies.get('oAuthToken')
		  , refreshToken = res.cookies.get('oAuthRefreshToken');

		// 1. If token is set.
		if (accessToken) {
			var decoded     = jwtDecode(accessToken)
			  , issueDate   = decoded.iat
			  , expiryDate  = decoded.exp
			  , validLength = expiryDate - issueDate
			  , currentTime = new Date()
			  , isExpired, isAlmostUp;

			// Convert to dates.
			isExpired  = currentTime.getTime() > new Date(expiryDate * 1000).getTime();
			isAlmostUp = currentTime.getTime() > new Date(
				Math.floor(expiryDate - (validLength / 10)) * 1000
			).getTime();

			// 1.1. If already past or almost up, request refresh.
			if (isExpired || isAlmostUp) {
				debug('Refreshing token');

				request({
					uri: env.oauth.tokenEndpoint,
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						Authorization: 'Basic ' + new Buffer(env.oauth.clientId + ':'
							+ env.oauth.clientSecret).toString('base64')
					},
					form: {
						grant_type: 'refresh_token',
						refresh_token: refreshToken,
						redirect_uri: env.oauth.redirectUrl
					}
				}, function (error, response, body) {
					if (error) {
						debug('Error received from token endpoint:', error);
					} else if (response.statusCode >= 200 && response.statusCode < 300) {
						var parsedBody   = JSON.parse(body)
						  , accessToken  = parsedBody.access_token
						  , refreshToken = parsedBody.refresh_token
						  , decoded      = jwtDecode(accessToken);

						debug('Refreshed JWT received for:', decoded.email);

						res.cookies.set('oAuthToken', accessToken);
						res.cookies.set('oAuthRefreshToken', refreshToken);
					} else {
						debug('Failed to refresh token:', response.body);
						// debug('Failed to refresh token:', response.statusCode);
					}
				});
			}
		}

		// 2. Passthru to other middlewares.
		next();
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
				var parsedBody   = JSON.parse(body)
				  , accessToken  = parsedBody.access_token
				  , refreshToken = parsedBody.refresh_token
				  , decoded      = jwtDecode(accessToken);

				debug('JWT received for:', decoded.email);

				userEmailMap(function (map) {
					return map.get(serializeValue(decoded.email));
				})(function (userId) {
					if (userId) return userId;

					var isPublicApp = req.$appName === 'public'
					  , demoUserId  = isPublicApp ? null : res.cookies.get('demoUser');

					if (!demoUserId) {
						return createUser({
							firstName: decoded.fname,
							lastName: decoded.lname,
							email: decoded.email,
							roles: ['user']
						});
					}

					return updateUser(demoUserId, {
						isDemo: undefined,
						firstName: decoded.fname,
						lastName: decoded.lname,
						email: decoded.email
					});
				}).done(function (userId) {
					if (!decoded.email_verified) {
						res.writeHead(302, { Location: '/request-confirm-account/' });
						res.end();
						return;
					}

					res.cookies.set('oAuthToken', accessToken);
					res.cookies.set('oAuthRefreshToken', refreshToken);

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
