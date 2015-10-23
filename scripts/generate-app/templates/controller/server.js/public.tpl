// Server specific controller customization.

'use strict';

var registerSubmit = require('eregistrations/controller/public/server').register.submit;

module.exports = exports = require('eregistrations/controller/public/server');

exports.register.submit =  function (data) {
	return registerSubmit.apply(this, arguments)(function (result) {
		this.target.roles.add('user');
		return result;
	}.bind(this));
};
