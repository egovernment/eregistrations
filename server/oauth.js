"use strict";

var debug          = require('debug-ext')('oauth')
  , mano           = require('mano')
  , deferred       = require('deferred')
  , assign         = require('es5-ext/object/assign')
  , userEmailMap   = require('mano/lib/server/user-email-map')
  , authentication = require('mano-auth/server/authentication')
  , serializeValue = require('dbjs/_setup/serialize/value')
  , generateUnique = require('time-uuid')
  , request        = require('request')
  , jwtDecode      = require('jwt-decode')
  , env            = mano.env;

var createUser = function (data) {
	return mano.queryMemoryDb([], 'addUser', JSON.stringify(data));
};

var registerDemoUser = function (userId, data) {
	return mano.queryMemoryDb([userId], 'registerDemoUser', { userId: userId, data: data });
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

var jwtTimeCodeToDate = function (timeCode) {
	return new Date(timeCode * 1000);
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
		deferred(null)(function () {
			var accessToken  = res.cookies.get('oAuthToken')
			  , refreshToken = res.cookies.get('oAuthRefreshToken')
			  , currentTime  = new Date()

			  , decodedAccessToken, accIssueTimeCode, accExpiryTimeCode, accExpiryDate, accValidLength
			  , refExpiryDate, isRefExpired, isAccExpired, isAccSoonToExpire, deferredRequest;

			// 1. If tokens are set.
			if (!accessToken || !refreshToken) return;

			// 1.1. Decode access token.
			decodedAccessToken = jwtDecode(accessToken);

			// 1.2. Get issue and expiry dates from token.
			accIssueTimeCode  = decodedAccessToken.iat;
			accExpiryTimeCode = decodedAccessToken.exp;
			accExpiryDate     = jwtTimeCodeToDate(accExpiryTimeCode);

			// 1.3. Calculate for how long access token is going to be valid.
			accValidLength = accExpiryTimeCode - accIssueTimeCode;

			// 1.4. Calculate refresh token expiry date.
			refExpiryDate = jwtTimeCodeToDate(accIssueTimeCode);
			refExpiryDate.setDate(refExpiryDate.getDate() + 1);

			// 2. If refresh token is already expired.
			isRefExpired = currentTime.getTime() > refExpiryDate.getTime();

			if (isRefExpired) {
				// 2.1 Logout user.
				debug('Refresh token expired');

				authentication.logout(req, res);
				return;
			}

			// 3. If access token is already expired or soon will be.
			isAccExpired      = currentTime.getTime() > accExpiryDate.getTime();
			isAccSoonToExpire = currentTime.getTime() > jwtTimeCodeToDate(Math.floor(
				accExpiryTimeCode - (accValidLength / 10)
			)).getTime();

			if (!isAccExpired && !isAccSoonToExpire) return;

			// 3.1. Request refresh.
			debug('Refreshing token');

			deferredRequest = deferred();

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
				var failed = false;

				if (error) {
					debug('Error received from token endpoint:', error);

					failed = true;
				} else if (response.statusCode >= 200 && response.statusCode < 300) {
					var parsedBody            = JSON.parse(body)
					  , newAccessToken        = parsedBody.access_token
					  , newRefreshToken       = parsedBody.refresh_token
					  , decodedNewAccessToken = jwtDecode(newAccessToken);

					debug('Refreshed JWT received for:', decodedNewAccessToken.email);

					res.cookies.set('oAuthToken', newAccessToken);
					res.cookies.set('oAuthRefreshToken', newRefreshToken);
				} else {
					debug('Failed to refresh token:', response.statusCode);

					failed = true;
				}

				if (failed && isAccExpired) {
					authentication.logout(req, res);
				}

				deferredRequest.resolve();
			});

			return deferredRequest.promise;
		}).done(function () {
			// 4. Passthru to other middlewares.
			next();
		});
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
				  , decoded      = jwtDecode(accessToken)
				  , isPublicApp  = req.$appName === 'public'
				  , roles        = ['user']
				  , demoUserId   = isPublicApp ? null : res.cookies.get('demoUser');

				debug('JWT received for:', decoded.email);

				userEmailMap(function (map) {
					return map.get(serializeValue(decoded.email));
				})(function (userId) {
					if (userId) return userId;

					if (!demoUserId) {
						return createUser({
							firstName: decoded.fname,
							lastName: decoded.lname,
							email: decoded.email,
							roles: roles
						});
					}

					return registerDemoUser(demoUserId, {
						firstName: decoded.fname,
						lastName: decoded.lname,
						email: decoded.email,
						roles: roles
					});
				}).done(function (userId) {
					if (!env.isAccountConfirmationDisabled && !decoded.email_verified) {
						if (demoUserId) {
							authentication.logout(req, res);
						}

						res.writeHead(302, { Location: '/request-confirm-account/' });
						res.end();
						return;
					}

					res.cookies.set('oAuthToken', accessToken);
					res.cookies.set('oAuthRefreshToken', refreshToken);

					authentication.login(userId, req, res);

					res.writeHead(303, {
						Location: '/',
						Authorization: 'Bearer ' + accessToken
					});
					res.end();
				}, function (error) {
					debug('Error while logging in:', error);

					// TODO: Notify user.
					res.writeHead(302, { Location: '/' });
					res.end();
				});
			} else {
				debug('Failed to authorize:', response.statusCode);

				// TODO: Notify user.
				res.writeHead(302, { Location: '/' });
				res.end();
			}
		});
	},
	profileMiddleware: function (req, res, next) {
		var isProfilePath = req._parsedUrl.pathname === '/oauth-profile/'
		  , accessToken   = res.cookies.get('oAuthToken');

		// 1. If not proper path or token is not set, end.
		if (!isProfilePath || !accessToken) {
			next();
			return;
		}

		res.writeHead(303, {
			Location: generateUrl(env.oauth.profileEndoint, { token: accessToken })
		});
		res.end();
	}
};
