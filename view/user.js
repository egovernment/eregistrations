// User: Basic data for business processes

'use strict';

var _ = require('mano').i18n.bind('User'),
loc     = require('mano/lib/client/location'),
columns = require('./_business-process-table-columns');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var businessSelect;

		section({ class: 'section-primary free-form' },
			md(_("# Welcome to Your Account #" +
				"\n ---" +
				"\n\n From here you can:" +
				"\n 1. Start Process A" +
				"\n 2. Start Process B"))
			);

		section({ class: 'section-primary' },
			h1("1. ", _("Online Services")),
			hr(),
			ul({ class: 'registration-init-actions' },
				exports._servicesBoxList(),
				function (item) {
					return _if(item.condition || true, li(
						item.button,
						div({ class: 'free-form' }, md(item.content))
					));
				}));

		insert(_if(this.user.businessProcesses._size, function () {
			section({ class: 'section-primary' },
				h1("2. ", _("My requests")),
				hr(),
				section(
					{ class: 'submitted-main table-responsive-container' },
					table(
						{ class: 'submitted-user-data-table submitted-current-user-data-table' },
						thead(tr(list(columns,
							function (column) { return th({ class: column.class }, column.head); }))),
						tbody(
							this.user.businessProcesses,
							function (businessProcess) {
								return tr(list(columns,
									function (column) {
										return td({ class: column.class }, column.data(businessProcess));
									}));
							}
						)
					)
				));
		}.bind(this)));

		section({ class: "section-primary user-doc-data" },
			h2("3. ", _("Documents and data")),
			hr(),
			businessSelect = select({ id: 'business-process-select' },
				option({ value: '/', selected: eq(loc._pathname, '/') },
					_("Select an entity to display its documents and data")),
				list(this.user.initialBusinessProcesses, function (process) {
					option({
						value: '/business-process/' + process.__id__ + '/',
						selected: eq(loc._pathname, '/business-process/' + process.__id__ + '/')
					},
						process._businessName);
				})),
			div({ id: 'preview' }));
		businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
			'\'#business-process-summary\'');
		businessSelect.onchange = function (ev) {
			loc.goto(ev.target.value);
		};
	}
};

exports._servicesBoxList = Function.prototype;
