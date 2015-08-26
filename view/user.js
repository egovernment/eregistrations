'use strict';

var _ = require('mano').i18n.bind('User'),
formatLastModified = require('./utils/last-modified'),
loc     = require('mano/lib/client/location');

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
						{ class: 'submitted-user-data-table submitted-current-user-data-table',
							responsive: true },
						thead(
							tr(
								th(_("Entity")),
								th(_("Service")),
								th(_("Submission date")),
								th(_("Withdraw date")),
								th(_("Inscriptions and controls")),
								th({ class: 'submitted-user-data-table-action' }),
								th({ class: 'submitted-user-data-table-action' })
							)
						),
						tbody(
							this.user.businessProcesses,
							function (businessProcess) {
								tr(
									td(businessProcess._businessName),
									td(businessProcess._label),
									td(businessProcess.submissionForms
										._isAffidavitSigned._lastModified.map(formatLastModified)),
									td(businessProcess._isApproved._lastModified.map(formatLastModified)),
									td(
										list(businessProcess.registrations.requested, function (reg) {
											return span({ class: 'label-reg' }, reg.abbr);
										})
									),
									td({ class: 'submitted-user-data-table-action' },
										_if(and(businessProcess._isFromEregistrations,
												eq(businessProcess._status, 'draft')),
											postButton({
												action: url('business-process', businessProcess.__id__, 'delete'),
												class: 'fa fa-trash-o',
												confirm: _("Are you sure?")
											})
											)),
									td({ class: 'submitted-user-data-table-action' },
										_if(businessProcess._isFromEregistrations,
											a({ href: url(businessProcess.__id__), rel: "server" },
												span({ class: 'fa fa-search' },
													_("Go to"))))
										)
								);
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
						value: '/summary/' + process.__id__ + '/',
						selected: eq(loc._pathname, '/summary/' + process.__id__ + '/')
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
