'use strict';

var _        = require('mano').i18n.bind('View: Supervisor')
  , once     = require('timers-ext/once')
  , dispatch = require('dom-ext/html-element/#/dispatch-event-2')
  , location = require('mano/lib/client/location');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var searchForm, searchInput, processingStepsTable;

		section({ class: 'section-primary users-table-filter-bar' },
			searchForm = form({ action: location.pathname, autoSubmit: true },
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

		processingStepsTable = table({ class: 'submitted-user-data-table' }, thead(), tbody());

		insert(processingStepsTable.pagination,
			section({ class: 'table-responsive-container' }, processingStepsTable),
			processingStepsTable.pagination);
	}
};
