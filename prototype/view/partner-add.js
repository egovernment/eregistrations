'use strict';

var _  = require('mano').i18n.bind('Add partner')
  , db = require('mano').db
  , generateSections = require('../../view/components/generate-form-sections')
  , partner = db.Partner.prototype;

exports._parent = require('./_user-main');

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	h1(_("Add new Partner"));
	insert(generateSections(partner.partnerFormSections, { isChildEntity: true }));
};
