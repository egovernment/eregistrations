'use strict';

// Allow only HTTP POST and GET methods in the system

module.exports = function (req, res, next) {
	if (req.method !== 'POST' && req.method !== 'GET') {
		res.statusCode = 405;
		res.setHeader('Allow', ['GET', 'POST']);
		res.end('Method Not Allowed');
		return;
	}
	next();
};
