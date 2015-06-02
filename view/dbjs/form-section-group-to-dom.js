'use strict';

var _  = require('mano').i18n.bind('Sections')
  , d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , forEach = require('es5-ext/object/for-each');

require('./form-section-base');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var mainFormResolvent, actionUrl, options = Object(arguments[1]), url
		  , customizeData, master = options.master || this.master;
		customizeData = { subSections: {} };
		mainFormResolvent = this.getFormResolvent(options);
		url = options.url || ns.url;
		actionUrl = url(this.constructor.actionUrl);
		if (options.isChildEntity) {
			actionUrl = master.constructor.prototype === master ?
					url(this.constructor.actionUrl + '-add') :
					url(this.constructor.actionUrl, master.__id__);
		}
		customizeData.arrayResult = [customizeData.container = ns.section(
			{ class: 'section-primary' },
			customizeData.form = ns.form({ id: this.domId, method: 'post',
					action: actionUrl,
					class: ns._if(ns.eq(
					this._status,
					1
				), 'completed form-elements', 'form-elements')
				},
				ns._if(this._label,
					[ns.h2(this._label),
						ns.hr()]),
				options.prepend,
				mainFormResolvent.formResolvent,
				ns.div({ id: mainFormResolvent.affectedSectionId }, ns.list(this.sections,
					function (subSection, subSectionName) {
						var formResolvent, legacy, control;
						customizeData.subSections[subSectionName] = {};
						formResolvent = subSection.getFormResolvent(options);
						legacy = subSection.getLegacy(this.domId, options);
						if (!subSection.forceRequiredInput) {
							control = { required: subSection.forceRequiredInput };
						}
						return ns.div({ class: 'section-primary-sub', id: subSection.domId },
							ns._if(subSection.label, ns.h3(subSection.label)),
							formResolvent.formResolvent,
							customizeData.subSections[subSectionName].fieldset = ns.fieldset(
								{ id: formResolvent.affectedSectionId, class: 'form-elements',
									dbjs: master, names: subSection.formPropertyNames,
									control: control,
									controls: legacy.controls }
							), formResolvent.legacyScript, legacy.legacy);
					}, this)).extend(options.append),
				ns.p({ class: 'submit-placeholder input' },
					ns.input({ type: 'submit', value: _("Submit") })),
				ns.p(
					{ class: 'section-primary-scroll-top' },
					ns.a({ onclick: 'window.scroll(0, 0)' },
						ns.span({ class: 'fa fa-arrow-up' }, "Back to top"))
				)
				)
		), mainFormResolvent.legacyScript];
		if (typeof options.customize === 'function') {
			forEach(customizeData.subSections, function (subSection) {
				subSection.fieldset = subSection.fieldset._dbjsFieldset;
			});
			options.customize.call(this, customizeData);
		}

		return customizeData.arrayResult;
	}));
