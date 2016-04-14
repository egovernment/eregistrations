'use strict';

var copy          = require('es5-ext/object/copy')
  , mano          = require('mano')
  , _             = require('mano').i18n.bind('Users Admin')
  , getOrderIndex = require('../users/get-default-order-index')
  , getUsersTable = require('../view/components/users-table/')
  , once          = require('timers-ext/once')
  , location      = require('mano/lib/client/location')
  , dispatch      = require('dom-ext/html-element/#/dispatch-event-2')

  , db = mano.db, env = mano.env, roleMeta = db.Role.meta;

exports._parent = require('./user-base');

exports.mapRolesToLabels = function (role) {
	if (!role) return 'N/A';
	if (role === 'user') return;
	if (roleMeta[role].label) return roleMeta[role].label;
	return '';
};

var baseColumns = [{
	head: _("Email"),
	data: function (user) { return [strong(user._fullName), br(), user._email]; }
}, {
	head: _("Role"),
	data: function (user) { return ul(user.roles, exports.mapRolesToLabels); }
}, {
	head: _("Institution"),
	data: function (user) { return user._institution; }
}, {
	head: _("Creation date"),
	data: function (user) { return new db.DateTime(user.lastModified / 1000); }
}, {
	head: th({ class: 'actions' }),
	data: function (user) {
		var isSelfUser = (user === this.user);
		return td({ class: 'actions' },
			a({ href: isSelfUser ? '/profile/' : url('user', user.__id__) },
				span({ class: 'fa fa-edit' }, _("Go to"))),
			!isSelfUser ? postButton({ buttonClass: 'actions-delete',
				action: url('user', user.__id__, 'delete'),
				confirm: _("Are you sure?"), value: span({ class: 'fa fa-trash-o' }) }) : null);
	}
}];

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var usersTable, searchForm, searchInput;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: '/', autoSubmit: true },
				div(
					label({ for: 'search-input' }, _("Search")),
					span({ class: 'input-append' },
						searchInput = input({ id: 'search-input', name: 'search', type: 'search',
							value: location.query.get('search') }),
						span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
				),
				div(
					input({ type: 'submit', value: _("Search") })
				)));

		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		var columns = baseColumns.map(function (conf) {
			conf = copy(conf);
			conf.data = conf.data.bind(this);
			return conf;
		}, this);

		usersTable = getUsersTable({
			getOrderIndex: getOrderIndex,
			itemsPerPage: env.objectsListItemsPerPage,
			class: 'submitted-user-data-table',
			columns: columns
		});
		p(a({ href: '/new-user/', class: 'button-main' }, _("New user")));
		insert(usersTable.pagination);
		section({ class: 'table-responsive-container' }, usersTable);
		insert(usersTable.pagination);
	}
};
