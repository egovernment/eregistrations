'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSection.prototype, 'toDOM',
	d(function (document, mainEntity/*, options*/) {
		var headerRank, options;
		options = Object(arguments[2]);
		headerRank = options.headerRank || 4;
		return ns.div(
			headersMap[headerRank](this.label),
			ns.hr(),
			ns.list(this.propertyNames, function (name) {
				return ns.table(
					ns.tbody(
						ns.tr(
							ns.th(mainEntity.getDescriptor(name).label),
							ns.td(mainEntity.getObservable(name))
						)
					)
				);
			})
		);
	}));
