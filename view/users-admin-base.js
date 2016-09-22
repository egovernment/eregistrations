'use strict';

var db = require('../db');

exports._parent = require('./abstract-user-base');

exports['submitted-menu'] = function () {
	li({ id: 'users-admin-nav', class: 'submitted-menu-item-active' }, a({ href: '/' },
		db.Role.meta[this.user.currentRoleResolved].label));
};
