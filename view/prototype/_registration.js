'use strict';

var db = require('mano').db
  , user = db.User.prototype;

exports['official-form'] =
		{ href: '/registration/user-id/',
		'': function () { insert('Register user'); }
		};

exports['official-user-details'] = { href: '/registration/user-id/documents' };

exports.certificates = function () {

};
