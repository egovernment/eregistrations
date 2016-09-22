'use strict';

var db           = require('../db')
  , uncapitalize = require('es5-ext/string/#/uncapitalize')
  , startsWith   = require('es5-ext/string/#/starts-with');

exports._parent = require('./abstract-user-base');

exports['submitted-menu'] = function () {
	var user = this.manager || this.user;

	insert(list(user.roles.filter(function (role) {
		return !['metaAdmin', 'usersAdmin', 'statistics'].some(function (disabledRole) {
			return role === disabledRole;
		});
	}), exports._getSubmittedMenuItem.bind(this)));
	insert(exports._submittedMenuExtraItems.call(this));
};

exports._getSubmittedMenuItem = function (role) {
	var user      = this.manager || this.user
	  , appName   = this.appName
	  , roleTitle = db.Role.meta[role].label
	  , viewPath, pending, pendingCount;

	if (role === 'user' && startsWith.call(appName, 'business-process-')) {
		return li(exports._getMyAccountButton(user, roleTitle));
	}

	if (startsWith.call(role, 'official')) {
		viewPath = exports._getPendingViewPath.call(this, role);

		if (viewPath) {
			pending  = db.views.businessProcesses.getBySKeyPath(viewPath);

			if (pending && pending.pending) {
				pendingCount = pending.pending._totalSize;
			} else {
				pendingCount = '-';
			}
		} else {
			pendingCount = '-';
		}

		if (user.currentRoleResolved === role) {
			return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle,
				' (', pendingCount, ')'));
		}

		return li(form({ method: 'post', action: '/set-role/' },
			input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
			button({ type: 'submit' }, roleTitle, ' (', pendingCount, ')')));
	}

	if (user.currentRoleResolved === role) {
		if (user.currentRoleResolved === 'manager') {
			if (appName === 'manager' || appName === 'manager-registration') {
				return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle));
			}
			return li({ class: 'submitted-menu-item-active' },
				exports._getManagerButton(user, roleTitle));
		}
		return li({ class: 'submitted-menu-item-active' }, a({ href: '/' }, roleTitle));
	}

	return li(form({ method: 'post', action: '/set-role/' },
		input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
		button({ type: 'submit' }, roleTitle)));
};

exports._getPendingViewPath = function (role) {
	return uncapitalize.call(role.slice('official'.length));
};

exports._submittedMenuExtraItems = Function.prototype;

exports._getManagerButton = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-currently-managed-user/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		input({ type: 'hidden',
			name: user.__id__ + '/currentlyManagedUser', value: null }),
		button({ type: 'submit' }, roleTitle));
};

exports._getRoleMenuItem = function (role) {
	var user = this.manager || this.user
	  , roleTitle;

	if (!db.Role.meta[role]) return;
	roleTitle = db.Role.meta[role].label;

	if (user.currentRoleResolved === role) {
		return li({ class: 'header-top-menu-dropdown-item-active' }, a({ href: '/' }, roleTitle));
	}

	return li(form({ method: 'post', action: '/set-role/' },
		input({ type: 'hidden', name: user.__id__ + '/currentRole', value: role }),
		button({ type: 'submit' }, roleTitle)));
};
