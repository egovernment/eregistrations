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
							var resolved = resolvePropertyPath(self.master, name), cond;
							if (!resolved.descriptor.required) {
								if ((typeof resolved.value === 'object') && resolved.value.__id__) {
									if (resolved.value instanceof File) {
										cond = resolved.value._path;
									} else if (typeof resolved.value.getDescriptor('resolvedValue')._value_
											=== 'function') {
										cond = not(eqSloppy(resolved.value._resolvedValue, null));
									} else {
										cond = not(eqSloppy(resolved.observable, null));
									}
								} else {
									cond = not(eqSloppy(resolved.observable, null));
								}
							} else {
								cond = true;
							}
							return _if(cond, ns.tr(ns.th(resolved.descriptor.label),
								td(resolved.value instanceof File ? _if(resolved.value._path, thumb(resolved.value))
									: (resolved.value && resolved.value._resolvedValue ?
											resolved.value._resolvedValue : resolved.observable))));
						});
					})
				)
			)
			);
	}));
