"use strict";

var db = require('mano').db
  , _  = require('mano').i18n.bind('View: Binding: Sections: Pickup institution')
  , ns = require('mano').domjs.ns
  , d  = require('d');

module.exports = Object.defineProperty(db.PickupInstitutionFormSection.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var url, frontDeskStep, options = Object(arguments[1]);
		url = options.url || ns.url;
		frontDeskStep = this.master.processingSteps.frontDesk;

		return ns.section({ class: 'section-primary' },
			ns.h2(_("Where do you want to collect your registrations?")),
			_if(this.formApplicablePropertyNames._size, [ns.form({
				method: 'post',
				action: url('pickup-institution'),
				class: ns._if(ns.eq(this._status, 1), 'completed')
			},
				ns.ul({ class: 'form-elements' }, this._formApplicablePropertyNames, function (prop) {
					if (prop === 'processingSteps/map/frontDesk/chosenInstitution') {
						return ns.li(
							ns.field({
								dbjs: frontDeskStep._chosenInstitution,
								control: { id: 'input-pickup-institution' },
								list: frontDeskStep.possibleInstitutions,
								property: 'name'
							})
						);
					}
					return ns.li(
						ns.field({
							dbjs: this.propertyMaster.resolveSKeyPath(prop).observable
						})
					);
				}.bind(this)),
				ns.p({ class: 'submit-placeholder' },
					input({ type: 'submit', value: _("Save") })))]),
			ns._if(and(ns.eq(frontDeskStep.possibleInstitutions._size, 1)),
				ns.p(_("You will need to withdraw your certificates at ${ institutionName }",
					{ institutionName: resolve(frontDeskStep._institution, 'name') }))),
			options.append
			);
	}));
