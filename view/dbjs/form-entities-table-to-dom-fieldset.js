/** Renders table of a FormEntitiesTable object
 * @param document {object} - document object, usually DOM
 * @param options {object} -
 * {
 *  addButtonLabel {string} - default "Add new"
 *  append {object} - domjs object to append after table
 *  customize {function} - customization callback
 *  master {object} - by default section's master object
 *  prepend {object} - domjs object to prepend before table
 *  url {string} - url used by the form (note: url is used to build action attribute for the form)
 * }
 * @returns {array} - array of constructed domjs elements
 */

'use strict';

var _                   = require('mano').i18n.bind('View: Binding: Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , generateId          = require('time-uuid')
  , loc                 = require('mano/lib/client/location')
  , ns                  = require('mano').domjs.ns
  , progressRules       = require('../components/progress-rules')
  , normalizeOptions    = require('es5-ext/object/normalize-options');

require('./form-section-base');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMFieldset',
	d(function (document/*, options */) {
		var self = this, options, url, customizeData, resolvent, tableData, resolved, getAddUrl,
			collectionType, addButton, isMapMode;
		options = normalizeOptions(arguments[1]);
		customizeData = { master: options.master || this.master };
		url = options.url || ns.url;
		resolvent = this.getFormResolvent(options);
		resolved = resolvePropertyPath(customizeData.master, this.propertyName);
		tableData = resolved.value;
		if (tableData instanceof db.NestedMap) {
			isMapMode = true;
			tableData = tableData.ordered;
			collectionType = resolved.value.getDescriptor('ordered').type;
			getAddUrl = function () {
				return url(self.baseUrl, 'p' + generateId());
			};
		} else {
			collectionType = resolved.descriptor.type;
			getAddUrl = function () {
				return url(self.baseUrl + '-add');
			};
		}
		customizeData.arrayResult = [
			options.prepend,
			resolvent.formResolvent ? ns.form({
				action: url(self.baseUrl + '-resolvent'),
				class: 'form-elements',
				autoSubmit: true,
				method: 'post'
			}, resolvent.formResolvent, ns.p({ class: 'submit' },
				ns.input({ type: 'submit', value: _("Submit") }))) : undefined,
			progressRules(this),
			ns.div({ class: 'entities-overview-table-wrapper', id: resolvent.affectedSectionId },
				ns.table(
					{ class: ns._if(ns.not(ns.eq(tableData._size, 0)),
						'entities-overview-table',
						'entities-overview-table entities-overview-table-empty') },
					ns.thead(
						ns.tr(ns.list(this.entities, function (entity) {
							return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
										ns._if(entity._mobileOnly, 'mobile-only')) },
									or(entity._label, resolvePropertyPath(
									collectionType.prototype,
									entity.propertyName
								).descriptor.label));
						}), ns.th(),
							ns.th({ class: 'actions' }))
					),
					ns.tbody({ onEmpty: ns.tr(ns.td({ colspan: this.entities.size + 2 },
								this.onEmptyMessage)
						) },
						tableData,
						function (entityObject) {
							var editUrl, deleteUrl, status;
							if (isMapMode) {
								editUrl = url(self.baseUrl, entityObject.key);
								deleteUrl = url(self.baseUrl, entityObject.key, 'delete');
							} else {
								editUrl = url(self.baseUrl, entityObject.__id__);
								deleteUrl = url(self.baseUrl, entityObject.__id__, 'delete');
							}
							if (self.sectionProperty === 'dataForms') {
								status = entityObject.dataForms._progress;
							} else {
								status = resolvePropertyPath(entityObject,
										self.sectionProperty + 'Status').observable;
							}
							return ns.tr(ns.list(self.entities, function (entity) {
								var resolved = resolvePropertyPath(entityObject, entity.propertyName)
								  , isObject = (typeof resolved.value === 'object') && resolved.value
										&& resolved.value.__id__;

								if (db.File && isObject && (resolved.value instanceof db.File)) {
									return td(_if(resolved.value._url,
											a({ href: resolved.value._url, target: '_blank' }, _("See picture"))));
								}
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
										ns.a({ href: editUrl },
											resolved.observable));
							}),
								ns.td({ class: ns._if(ns.eq(status, 1),
										'completed') },
									ns.span({ class: 'status-complete' }, "✓"),
									ns.span({ class: 'hint-optional hint-optional-left status-incomplete',
											'data-hint': _("Some required fields are not filled") },
										"!")),
								ns.td({ class: 'actions' },
									ns.a({ class: 'actions-edit',
											href: editUrl },
										ns.span({ class: 'fa fa-edit' }, _("Edit"))),
									ns.postButton({ buttonClass: 'actions-delete',
										action: deleteUrl,
										value: ns.span({ class: 'fa fa-trash-o' },
											_("Delete")) })));
						}),
					this.generateFooter &&
						ns.tfoot(this.generateFooter(
							resolvePropertyPath(customizeData.master, this.propertyName).value
						))
				),
				options.append,
				resolvent.legacyScript,
				ns.p({ class: 'entities-overview-table-buttons' },
					customizeData.addButton = addButton = ns.a(
						{ class: 'button-regular', href: getAddUrl() },
						options.addButtonLabel || _("Add ${ entityLabel }",
							{ entityLabel: collectionType.prototype.label })
					)))
		];
		if (isMapMode) {
			loc.on('change', function (ev) {
				if (loc.pathname !== addButton.pathname) return;
				addButton.href = getAddUrl();
			});
		}
		if (typeof options.customize === 'function') {
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
