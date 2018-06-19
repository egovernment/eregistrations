// User: Chosen business process main display

'use strict';

var normalizeOptions      = require('es5-ext/object/normalize-options')
  , _                     = require('mano').i18n.bind('View: User')
  , loc                   = require('mano/lib/client/location')
  , documentsAndDataBrief = require('./components/business-process-documents-and-data-brief')
  , getData               = require('mano/lib/client/xhr-driver').get
  , ObservableSet         = require('observable-set')
  , jsonToObservables     = require('../utils/json-to-observables')
  , db                    = require('../db');

exports._parent = require('./user');
exports._match = 'businessProcess';

exports['user-account-data'] = { class: { active: true } };
exports['user-account-content'] = function () {
	var businessProcesses = new ObservableSet([])
	  , sourceCollection = this.user.initialBusinessProcesses.filterByKey('isSubmitted', true);
	sourceCollection.forEach(function (bp) {
		businessProcesses.add(bp);
	});
	sourceCollection.on('change', function (event) {
		if (event.type === 'add') {
			businessProcesses.add(event.value);
		}
		if (event.type === 'delete') {
			businessProcesses.forEach(function (bp) {
				if (bp.__id__ === event.value.__id__) {
					businessProcesses.delete(bp);
				}
			});
		}
	});
	getData('/get-external-requests/').done(function (items) {
		if (!items) return;
		items.forEach(function (req) {
			var bp = req;
			// only completed have certs...
			if (bp.status !== db.BusinessProcessStatus.meta.closed.label) return;
			businessProcesses.add(jsonToObservables(req));
		});
	});

	insert(_if(gt(businessProcesses._size, 1), function () {
		var businessSelect;
		var result = [div({ class: "section-primary-sub-small" },
			p({ class: 'section-primary-legend' }, label({ for: 'business-process-select' },
				_("Please select an entity in the selector below to display it documents and data"))),
			p({ class: 'user-account-selector' },
				businessSelect = select({ id: 'business-process-select' },
					option({ value: '/', selected: eq(loc._pathname, '/') },
						_("Select an entity to display its documents and data")),
					list(businessProcesses, function (process) {
						option({
							value: process.link ?
									'external::' + process.link : '/requests/' + process.__id__ + '/',
							selected: eq(loc._pathname, '/requests/' + process.__id__ + '/')
						}, process._businessName);
					}))))];
		businessSelect.setAttribute('onchange', 'location.href = this.value + ' +
			'\'#business-process-summary\'');
		businessSelect.onchange = function (ev) {
			var externalLink = ev.target.value && ev.target.value.slice('external::'.length);
			var externalBp = null;
			if (ev.target.value.slice(0, 'external::'.length) === 'external::') {
				businessProcesses.forEach(function (bp) {
					if (bp.link && bp.link.value === externalLink) {
						externalBp = bp;
					}
				});
				if (!externalBp) return;
				var previewElem = document.getElementById('user-requests-preview');
				if (previewElem) {
					loc.goto('/requests/');
					previewElem.innerHTML =
						'<div class="section-primary-sub user-account-content-selector">' +
						'<h2>' + _("Documents") + '</h2>' +
						'<p class="section-primary-legend">' +
						_("Here you can see documents that you uploaded as part of the application and the " +
							"certificates issued in the process.") + '</p>' +
						'<div class="table-responsive-container">' +
							'<table class="submitted-user-data-table user-request-table">' +
								'<thead>' +
									'<th class="submitted-user-data-table-status"></th>' +
									'<th>' + _("Name") + '</th>' +
									'<th>' + _("Issuer") + '</th>' +
									'<th class="submitted-user-data-table-date">' + _("Issue date") + '</th>' +
									'<th class="submitted-user-data-table-link"></th>' +
								'</thead>' +
								'<tbody>' +
									'<td class="submitted-user-data-table-status"></td>' +
									'<td colspan="3">' + _("Certificates obtained through external service") +
									'</td>' +
									'<td><a href="' + externalBp.link +
									'" target="_blank"><span class="fa fa-search">' +
									_("Go to") + '</span></a></td>' +
								'</tbody>' +
							'</table>' +
						'</div>' +
						'</div>';
				}
				return;
			}
			loc.goto(ev.target.value);
		};
		return result;
	}, function () {
		return mmap(businessProcesses._first, function (businessProcess) {
			if (!businessProcess) return p(_('No requests started'));
			return documentsAndDataBrief(normalizeOptions(this, { businessProcess: businessProcess }));
		}, this);
	}.bind(this)));
	div({ id: 'user-requests-preview' });
};
