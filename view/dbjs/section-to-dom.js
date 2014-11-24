'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path');

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document/*, options*/) {
		var self, headerRank, cssClass, options;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		return ns.section({ class: cssClass },
			this.label && headersMap[headerRank](this._label),
			ns.table(
				ns.tbody(
					ns.list(this.propertyNames, function (name) {
						ns.tr(ns.th(resolvePropertyPath(self.master, name).descriptor.label),
							ns.td(resolvePropertyPath(self.master, name).observable));
					})
				)
			)
			);
	}));
