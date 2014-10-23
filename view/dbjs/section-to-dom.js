'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document/*, options*/) {
		var self, headerRank, cssClass, options;
		self = this;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		return ns.section({ class: cssClass },
			headersMap[headerRank](this.constructor.label),
			ns.table(
				ns.tbody(
					ns.list(this.propertyNames, function (name) {
						ns.tr(ns.th(self.master.getDescriptor(name).label),
							ns.td(self.master.getObservable(name)));
					})
				)
			)
			);
	}));
