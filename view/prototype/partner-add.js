'use strict';

var db = require('mano').db
  , generateSections = require('../components/generate-form-sections')
  , partner = db.Partner.prototype;

exports['step-form'] = { class: { 'step-active': true } };

exports.step = function () {
	generateSections(partner.formSections);
};
