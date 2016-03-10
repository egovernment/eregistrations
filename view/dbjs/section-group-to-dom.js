'use strict';

var d  = require('d')
  , db = require('mano').db
  , ns = require('mano').domjs.ns
  , headersMap = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOM',
	d(function (document/*,options */) {
		var headerRank, cssClass, options;
		options = Object(arguments[1]);
		headerRank = options.headerRank || 3;
		cssClass   = options.cssClass || 'entity-data-section';
		return ns.section({ class: cssClass },
			ns._if(this._label, [headersMap[headerRank](this._label)]),
			ns.list(this.sections, function (section) {
				return _if(section._status, section.toDOM(document, {
					headerRank: headerRank + 1,
					cssClass: 'entity-data-section-sub',
					viewContext: options.viewContext
				}));
			}));
	}));
