'use strict';

var _  = require('mano').i18n.bind('Add partner')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , generateSections = require('../components/generate-form-sections')
  , partner = db.Partner.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	return ns.insert(ns.h1(_("Add new Partner")),
		generateSections(partner.partnerFormSections));
};
