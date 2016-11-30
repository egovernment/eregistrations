'use strict';

var _        = require('mano').i18n.bind('View: Offcial')
  , location = require('mano/lib/client/location')
  , toArray  = require('es5-ext/object/to-array')
  , once     = require('timers-ext/once')
  , dispatch = require('dom-ext/html-element/#/dispatch-event-2')
  , renderStatsOverview = require('./components/render-stats-overview')
  , getDynamicUrl = require('./utils/get-dynamic-url')

  , byOrder  = function (a, b) { return this[a].order - this[b].order; };

exports._parent = require('./user-base');
exports._urlParams = ['status', 'search', 'page'];

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var searchForm, searchInput, businessProcessesTable, formAction;
		formAction = getDynamicUrl('/', { filter: exports._urlParams });
		exports._optionalContentTop.call(this);
		renderStatsOverview(this);
		exports._optionalContent.call(this);
		// this should not happen, but it might if we don't block illegal role dependencies
		if (!exports._statusMap.call(this)) return;
		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: formAction, autoSubmit: true },
				div({ class: 'users-table-filter-bar-status' },
					label({ for: 'state-select' }, _("Status"), ":"),
					select({ id: 'state-select', name: 'status' },
						toArray(exports._statusMap.call(this), function (data, name) {
							return option({ value: data.default ? '' : name, selected:
								location.query.get('status').map(function (value) {
									var selected = (name ? (value === name) : (value == null));
									return selected ? 'selected' : null;
								}) },
								data.label);
						}, null, byOrder))),
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
			));
		searchInput.oninput = once(function () { dispatch.call(searchForm, 'submit'); }, 300);

		businessProcessesTable = exports._businessProcessTable.call(this);

		if (businessProcessesTable) {
			insert(businessProcessesTable.pagination,
				section({ class: 'table-responsive-container' }, businessProcessesTable),
				businessProcessesTable.pagination);
		}
	}
};

exports._optionalContent = Function.prototype;
exports._optionalContentTop = Function.prototype;
exports._statusMap = Function.prototype;
exports._businessProcessTable = Function.prototype;
