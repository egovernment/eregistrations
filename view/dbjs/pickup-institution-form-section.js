"use strict";

var db = require('mano').db
  , _  = require('mano').i18n.bind('View: Binding: Sections: Pickup institution')
  , ns = require('mano').domjs.ns
  , d  = require('d');

module.exports = Object.defineProperty(db.PickupInstitutionFormSection.prototype, 'toDOMForm',
	d(function (document/*, options */) {
		var url, frontDeskStep, options = Object(arguments[1]);
		url = options.url || ns.url;
		frontDeskStep = this.master.processingSteps.map.frontDesk;

		return ns.section({ class: 'section-primary' },
			ns.h2(_("Where do you want to collect your registrations?")),
			ns._if(ns.eq(frontDeskStep.possibleInstitutions._size, 1),
				ns.p(_("You will need to withdraw your certificates at ${ institutionName }",
					{ institutionName: resolve(frontDeskStep._institution, 'name') })),
				[ns.form({ method: 'post', action: url('pickup-institution'),
						class: ns._if(ns.eq(this._status, 1), 'completed') },
					ns.ul({ class: 'form-elements' },
						ns.li(
							ns.field({
								dbjs: frontDeskStep._chosenInstitution,
								control: { id: 'input-pickup-institution' },
								list: frontDeskStep.possibleInstitutions,
								property: 'name'
							})
						)),
					ns.p({ class: 'submit-placeholder' },
						input({ type: 'submit', value: _("Save") })))]
				),
			options.append
			);
	}));
