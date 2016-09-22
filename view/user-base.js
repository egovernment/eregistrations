'use strict';

var _                    = require('mano').i18n.bind('View: User')
  , db                   = require('../db')
  , uncapitalize         = require('es5-ext/string/#/uncapitalize')
  , startsWith           = require('es5-ext/string/#/starts-with')
  , requestAccountDialog = require('./components/request-account-dialog')
  , myAccountButton;

myAccountButton = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-business-process/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		button({ type: 'submit' }, roleTitle));
};

exports._parent = require('./abstract-user-base');

exports['submitted-menu'] = function () {
	var user = this.manager || this.user;

	insert(list(user.roles.filter(function (role) {
		switch (role) {
		case 'user':
		case 'manager':
		case 'managerValidation':
		case 'dispatcher':
		case 'supervisor':
			return true;
		default:
			return (/^official[A-Z]/).test(role);
		}
	}), exports._getSubmittedMenuItem.bind(this)));
	insert(exports._submittedMenuExtraItems.call(this));
};

exports['sub-main-prepend'] = function () {
	insert(_if(this.user._isDemo,
		div({ class: 'submitted-menu-demo-msg' },
			div({ class: 'content' },
				h3(_("Demo version")),
				p(_("Introduction to demo version"))))));

	insert(_if(this.manager, function () {
		return this.manager._currentlyManagedUser.map(function (managedUser) {
			if (!managedUser) return;
			var isUserReallyManaged = eq(this.manager, managedUser._manager);

			requestAccountDialog(managedUser);

			return div({ class: 'manager-bar' },
				div({ class: 'content' },
					div({ class: 'manager-bar-info' },
						span(_("Client"), ": "),
							this.appName === 'user' ? a({ href: '/' }, managedUser._fullName)
							: myAccountButton(this.manager, managedUser._fullName)),
					_if(isUserReallyManaged, div({ class: 'manager-bar-actions' },
						_if(not(managedUser._isActiveAccount),
							a({
								class: 'actions-create',
								href: '#request-create-account'
							}, span(_('Create account for this client')))),
						a({ href: '/managed-user-profile/' },
							span({ class: 'hint-optional hint-optional-left',
									'data-hint': _('edit user details') },
								i({ class: 'fa fa-cog' })))))));
		}.bind(this));
	}.bind(this)));
};

exports._getSubmittedMenuItem = function (role) {
	var user      = this.manager || this.user
	  , appName   = this.appName
	  , roleTitle = db.Role.meta[role].label
	  , viewPath, pending, pendingCount;

	if (role === 'user' && startsWith.call(appName, 'business-process-')) {
		return li(myAccountButton(user, roleTitle));
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
