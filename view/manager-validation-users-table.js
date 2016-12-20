'use strict';

var _                   = require('mano').i18n.bind('View: Official: Manager validation')
  , location            = require('mano/lib/client/location')
  , copy                = require('es5-ext/object/copy')
  , ReactiveTable       = require('reactive-table')
  , ReactiveTableList   = require('reactive-table/list')
  , mano                = require('mano')
  , activateManagerForm = require('./components/activate-manager-form')
  , getUsersTable       = require('./components/users-table/')
  , getOrderIndex       = require('../users/get-default-order-index')
  , compareUsers        = require('../utils/get-compare')(getOrderIndex)
  , once                = require('timers-ext/once')
  , dispatch            = require('dom-ext/html-element/#/dispatch-event-2')

  , db = mano.db, env = mano.env, roleMeta = db.Role.meta;

exports._parent = require('./user-base');

var mapRolesToLabels = function (role) {
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
	data: function (user) { return ul(user.roles, mapRolesToLabels); }
}, {
	head: _("Institution"),
	data: function (user) { return user._institution; }
}, {
	head: _("Creation date"),
	data: function (user) { return new db.DateTime(user.lastModified / 1000); }
}, {
	head: _("Activate/Disable"),
	data: activateManagerForm
}, {
	head: th({ class: 'actions' }),
	data: function (user) {
		var isSelfUser = (user === this.user);
		return td({ class: 'actions' },
			a({ href: isSelfUser ? '/profile/' : url('user', user.__id__) },
				span({ class: 'fa fa-edit' }, _("Go to"))),
			_if(and(user._canBeDestroyed, !isSelfUser), postButton({ buttonClass: 'actions-delete',
				action: url('user', user.__id__, 'delete'),
				confirm: _("Are you sure?"), value: span({ class: 'fa fa-trash-o' }) }), null));
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
		if (db.views && db.views.managerValidation) {
			usersTable = getUsersTable({
				views: db.views.managerValidation,
				getOrderIndex: getOrderIndex,
				itemsPerPage: env.objectsListItemsPerPage,
				class: 'submitted-user-data-table',
				columns: columns
			});
		} else {
			usersTable = new ReactiveTable(
				document,
				new ReactiveTableList(db.User.instances.filterByKey('email'), compareUsers),
				columns
			);
			usersTable.table.classList.add('submitted-user-data-table');
		}

		p(a({ href: '/new-user/', class: 'button-main' }, _("Add manager")));
		insert(usersTable.pagination);
		section({ class: 'table-responsive-container' }, usersTable);
		insert(usersTable.pagination);
	}
};
