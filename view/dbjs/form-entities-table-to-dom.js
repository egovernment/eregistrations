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

var _                   = require('mano').i18n.bind('Sections')
  , d                   = require('d')
  , db                  = require('mano').db
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , generateId          = require('time-uuid')
  , loc                 = require('mano/lib/client/location')
  , ns                  = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var self = this, options, url, customizeData, resolvent, tableData, resolved, getAddUrl,
			collectionType, addButton, isMapMode, _d = _, translationInserts;
		options = Object(arguments[1]);
		customizeData = { master: options.master || this.master };
		url = ns.url;
		url = options.url || ns.url;
		resolvent = this.getFormResolvent(options);
		resolved = resolvePropertyPath(customizeData.master, this.propertyName);
		translationInserts = { max: self._max, min: self._min };
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
		customizeData.arrayResult = [customizeData.container = ns.section(
			{ id: this.domId, class: ns._if(ns.eq(
				this._status,
				1
			), 'section-primary completed entities-overview', 'section-primary entities-overview') },
			ns._if(this._label,
				[ns.h2(this._label),
					ns.hr()]),
			options.prepend,
			resolvent.formResolvent ? ns.form({
				action: url(self.baseUrl + '-resolvent'),
				autoSubmit: true,
				method: 'post'
			}, resolvent.formResolvent, ns.p({ class: 'submit' },
				ns.input({ type: 'submit', value: _("Submit") }))) : undefined,

			ns._if(gtOrEq(self.progressRules.invalid._size, 1),
				div({ class: 'entities-overview-info' },
					ns._if(eq(self.progressRules.invalid._size, 1),
						function () {
							return p(_d(self.progressRules.invalid.first._message, translationInserts));
						},
						ul(self.progressRules.invalid,
							function (rule) {
								return ns.li(_d(rule.message, translationInserts));
							})))),

			ns.div({ class: 'entities-overview-table-wrapper', id: resolvent.affectedSectionId },
				ns.table(
					{ class: ns._if(ns.not(ns.eq(tableData._size, 0)),
						'entities-overview-table',
						'entities-overview-table entities-overview-table-empty') },
					ns.thead(
						ns.tr(ns.list(this.entities, function (entity) {
							return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
										ns._if(entity._mobileOnly, 'mobile-only')) },
									resolvePropertyPath(
									collectionType.prototype,
									entity.propertyName
								).descriptor.label);
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
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
										ns.a({ href: editUrl },
											resolvePropertyPath(entityObject, entity.propertyName).observable));
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
							resolvePropertyPath(this.master, this.propertyName).value
						))
				),
				options.append,
				resolvent.legacyScript,
				ns.p(
					customizeData.addButton = addButton = ns.a(
						{ class: 'button-regular', href: getAddUrl() },
						options.addButtonLabel || _("Add new")
					)
				)),
			ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
						_("Back to top"))))
		)];
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
