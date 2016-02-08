// User Manager: Requests view

'use strict';

var _            = require('mano').i18n.bind('View: Requests')
  , db           = require('mano').db
  , businessStatuses = db.BusinessProcessStatus.meta
  , toArray       = require('es5-ext/object/to-array')
  , actionsColumn = require('./_business-process-table-columns').actionsColumn
  , formatLastModified = require('./utils/last-modified')
  , location     = require('mano/lib/client/location')
  , once          = require('timers-ext/once')
  , dispatch      = require('dom-ext/html-element/#/dispatch-event-2');

exports._parent = require('./manager');

exports['manager-account-requests'] = { class: { active: true } };

exports['manager-account-content'] = function () {
	var searchForm, searchInput
	  , requests = this.user.managedBusinessProcesses;

	section({ class: 'section-primary users-table-filter-bar' },
		searchForm = form({ action: '/requests/', autoSubmit: true },
			div({ class: 'users-table-filter-bar-status' },
				label({ for: 'state-select' }, _("Status"), ":"),
				select({ id: 'state-select', name: 'status' },
					toArray(businessStatuses, function (item) {
						return option({ value: item.key, selected:
							location.query.get('status').map(function (value) {
								var selected = (item.key ? (value === item.key) : (value == null));
								return selected ? 'selected' : null;
							}) },
							item.label);
					}))),
			div(
				label({ for: 'search-input' }, _("Search")),
				span({ class: 'input-append' },
					searchInput = input({ id: 'search-input', name: 'search', type: 'search',
						value: location.query.get('search') }),
					span({ class: 'add-on' }, span({ class: 'fa fa-search' })))
			),
			div(
				input({ type: 'submit', value: _("Search") })
			)),
		div(
			a({ href: mmap(location.query.get('status'), function (status) {
				return mmap(location.query.get('page'), function (page) {
					var search = [];
					if (status) search.push('status=' + status);
					if (page) search.push('page=' + page);
					if (search.length) search = '?' + search.join('&');
					else search = null;
					return url('print-business-processes-list', search);
				});
			}), class: 'users-table-filter-bar-print', target: '_blank' },
				span({ class: 'fa fa-print' },
					_("Print list of requests")), _("Print the list")
				)
		)
		);

	searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

	insert(_if(requests._size, function () {
		return section({ class: 'submitted-main table-responsive-container' },
			table(
				{ class: 'submitted-user-data-table' },
				thead(tr(
					th(_("Service")),
					th(_("Client")),
					th(_('Entity')),
					th(_('Submission date')),
					th(_('State')),
					th()
				)),
				tbody(
					requests.toArray(function (req1, req2) {
						return req1.lastModified - req2.lastModified;
					}),
					function (request) {
						return tr(
							td(request._label),
							td(request.user._fullName),
							td(request._businessName),
							td(_if(request._isSubmitted, function () {
								return request._isSubmitted._lastModified.map(formatLastModified);
							})),
							td(request._status),
							td({ class: 'actions' }, actionsColumn.data(request))
						);
					}
				)
			));
	}.bind(this),
		md(_('You have no requests yet.'))));
};
