// User: Chosen business process main display

'use strict';

var _ = require('mano').i18n.bind('View: Business process summary')
  , formatter = require('./utils/date-formatter');

exports._parent = require('./user');

exports.preview = function () {
	var businessProcess = this.target;
	return div(
		div({ class: "section-primary-sub" },
			h3(_("Documents")),
			require('./_documents-list')(businessProcess.cumulatedDocuments.toArray().slice(0, 5)),
			p(a({ href: "/documents/" + businessProcess.__id__ + "/", class: 'button-regular' },
				_("See all documents"))),
			div({ class: "section-primary-sub" },
				h3(_("Data")),
				div({ class: "table-responsive-container" },
					table({ class: "submitted-user-data-table submitted-current-user-data-table" },
						thead(tr(th(_("Section")), th(_("Edit date")), th())),
						tbody({ onEmpty: tr({ class: 'empty' }, td({ colspan: 3 }, _("No data"))) },
							businessProcess.cumulatedSections, function (section) {
								tr(
									td(section._label),
									td(section._lastEditDate.map(function (date) {
										return formatter(date * 1000);
									})),
									td({ class: 'user-doc-data-table-actions' },
										a({ href: "/data/" + businessProcess.__id__ + "/" },
											span({ class: 'fa fa-search' }, _("Go to"))))
								);
							}))),
				p(a({ href: "/data/" +  businessProcess.__id__ + "/", class: 'button-regular' },
						_("See all data")))))
	);
};
