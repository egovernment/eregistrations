'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map')
  , resolvePropertyPath = require('dbjs/_setup/utils/resolve-property-path')
  , File                = db.File;

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document/*, options*/) {
		var self, headerRank, cssClass, options, filteredNames;
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
								self.resolventProperty).descriptor.label),
							ns.td(resolvePropertyPath(self.master,
								self.resolventProperty).observable));
					}),
					ns._if(ns.eq(self._isUnresolved, false), function () {
						return ns.list(filteredNames = self.applicablePropertyNames.filter(function (name) {
							var observable = resolvePropertyPath(self.master, name).observable;
							observable.once('change', function (event) { filteredNames.refresh(name); });
							return observable.value != null;
						}), function (name) {
							var resolved = resolvePropertyPath(self.master, name);
							if (resolved.value instanceof File) {
								return ns.tr(ns.th(resolved.descriptor.label), ns.td(thumb(resolved.value)));
							}
							return ns.tr(ns.th(resolved.descriptor.label), ns.td(resolved.observable));
						});
					})
				)
			)
			);
	}));
