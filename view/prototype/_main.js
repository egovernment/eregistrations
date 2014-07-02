'use strict';

var register = require('./_register')
  , login    = require('./_login');

exports.body = function () {
	p(a({ onclick: login.show }, "LOGIN"));
	p(a({ onclick: register.show }, "REGISTER"));
	p(a({ href: '/public-inner/' }, "PUBLIC INNER"));

	div({ id: 'main' });
};
