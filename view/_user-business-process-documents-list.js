// User: Chosen business process main display documents

'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , _             = require('mano').i18n.bind('View: Documents list');

var compareByLabel = function (a, b) {
	return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
};

module.exports = function (businessProcess/*, options*/) {
	var options = Object(arguments[1]);
	return div({ class: "table-responsive-container" },
		mmap(businessProcess.requirementUploads.dataSnapshot._resolved, function (uploadsData) {
			if (uploadsData) {
				uploadsData.forEach(function (documentData) { documentData.kind = 'document'; });
			}
			return mmap(businessProcess._isApproved, function (isApproved) {
				return mmap(businessProcess.certificates.dataSnapshot._resolved, function (certsData) {
					var data;
					if (certsData && isApproved) {
						certsData.forEach(function (documentData) { documentData.kind = 'certificate'; });
						if (uploadsData) data = uploadsData.concat(certsData);
						else data = certsData;
					} else {
						data = uploadsData;
					}
					if (data) data = data.sort(compareByLabel).slice(0, options.limit || Infinity);
					return table({ class: 'submitted-user-data-table user-request-table' },
						thead(
							tr(
								th({ class: 'submitted-user-data-table-status' }),
								th(_("Name")),
								th(_("Issuer")),
								th({ class: 'submitted-user-data-table-date' }, _("Issue date")),
								th({ class: 'submitted-user-data-table-link' })
							)
						),
						tbody(!data
							? tr({ class: 'empty' }, td({ colspan: 5 }, _("No documents")))
							: data.map(function (documentData) {
								return tr(
									td({ class: 'submitted-user-data-table-status' },
										(documentData.kind === 'certificate')
										? span({ class: 'fa fa-certificate' }) : null),
									td(documentData.label),
									td(documentData.issuedBy),
									td({ class: 'submitted-user-data-table-date' }, documentData.issueDate),
									td({ class: 'submitted-user-data-table-link' },
										a({ href: '/business-process/' + businessProcess.__id__ + '/' +
											documentData.kind + '/' + camelToHyphen.call(documentData.uniqueKey) + '/' },
											span({ class: 'fa fa-search' }, _("Go to"))))
								);
							})));
				});
			});
		}));
};
