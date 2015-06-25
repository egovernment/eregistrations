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
  , isNested            = require('dbjs/is-dbjs-nested-object')
  , ns                  = require('mano').domjs.ns;

require('./form-section-base');

module.exports = Object.defineProperty(db.FormEntitiesTable.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var self = this, options, url, customizeData, resolvent, tableData, resolved, getAddUrl;
		customizeData = {};
		url = ns.url;
		options = Object(arguments[1]);
		url = options.url || ns.url;
		getAddUrl = function () {
			return url(self.baseUrl + '-add');
		};
		resolvent = this.getFormResolvent(options);
		resolved = resolvePropertyPath(this.master, this.propertyName);
		if (resolved.descriptor.type === db.NestedMap) {
			resolved = resolvePropertyPath(this.master, this.propertyName + '/ordered');
			getAddUrl = function () {
				return url(self.baseUrl, 'p' + generateId());
			};
		}
		tableData = resolved.value;
		customizeData.arrayResult = [customizeData.container = ns.section(
			{ id: this.domId, class: ns._if(ns.eq(
				this._status,
				1
			), 'section-primary completed entities-overview', 'section-primary entities-overview') },
			ns._if(this._label,
				[ns.h2(this._label),
					ns.hr()]),
			options.prepend,
			resolvent.formResolvent,
			ns.div({ id: resolvent.affectedSectionId },
				ns.table(
					{ class: ns._if(ns.not(ns.eq(tableData._size, 0)),
						'entities-overview-table',
						'entities-overview-table entities-overview-table-empty') },
					ns.thead(
						ns.tr(ns.list(this.entities, function (entity) {
							return ns.th({ class: ns._if(entity._desktopOnly, 'desktop-only',
										ns._if(entity._mobileOnly, 'mobile-only')) },
									resolvePropertyPath(
									resolved.descriptor.type.prototype,
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
							var editUrl, deleteUrl;
							editUrl = url(self.baseUrl, isNested(entityObject) ?
									entityObject.key : entityObject.__id__);
							deleteUrl = url(self.baseUrl, isNested(entityObject) ?
									entityObject.key : entityObject.__id__, 'delete');
							return ns.tr(ns.list(self.entities, function (entity) {
								return ns.td({ class: ns._if(entity._desktopOnly, 'desktop-only',
											ns._if(entity._mobileOnly, 'mobile-only')) },
										ns.a({ href: editUrl },
											resolvePropertyPath(entityObject, entity.propertyName).observable));
							}),
								ns.td({ class: ns._if(ns.eq(resolvePropertyPath(entityObject,
												self.sectionProperty + 'Status').observable, 1),
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
					customizeData.addButton = ns.a(
						{ class: 'button-main', href: getAddUrl() },
						options.addButtonLabel || _("Add new")
					)
				)),
			ns.p({ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' }, ns.span({ class: 'fa fa-arrow-up' },
						_("Back to top"))))
		)];
		loc.on('change', function (ev) {
			if (ev.newValue.search(customizeData.addButton.href) !== -1) {
				customizeData.addButton.href = getAddUrl();
			}
		});
		if (typeof options.customize === 'function') {
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
