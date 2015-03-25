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
			ns._if(self._label, [headersMap[headerRank](self._label), ns.hr()]),
			ns.table(
				ns.tbody(
					ns._if(self._isUnresolved, function () {
						return ns.tr(ns.th(resolvePropertyPath(self.master,
								self.constructor.resolventProperty).descriptor.label),
							ns.td(resolvePropertyPath(self.master,
								self.constructor.resolventProperty).observable));
					}, function () {
						return ns.list(self.propertyNames, function (name) {

							return ns._if(ns.not(
								ns.eqSloppy(resolvePropertyPath(self.master, name).observable, null)
							),
								ns.tr(ns.th(resolvePropertyPath(self.master, name).descriptor.label),
									ns.td(resolvePropertyPath(self.master, name).observable)));
						});
					})
				)
			)
			);
	}));
