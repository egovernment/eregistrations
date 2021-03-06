'use strict';

var d                = require('d')
  , db               = require('mano').db
  , ns               = require('mano').domjs.ns
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , headersMap       = require('../utils/headers-map');

module.exports = Object.defineProperty(db.FormSectionGroup.prototype, 'toDOM',
	d(function (document/*,options */) {
		var headerRank, cssClass, disableHeader, options;
		options       = Object(arguments[1]);
		headerRank    = options.headerRank || 3;
		cssClass      = options.cssClass || 'entity-data-section';
		disableHeader = options.disableHeader;

		var childOptions = normalizeOptions(options);
		childOptions.headerRank++;
		childOptions.disableHeader = null;
		childOptions.cssClass      = 'entity-data-section-sub';

		return ns.section({ class: cssClass },
			disableHeader ? null : ns._if(this._label, [headersMap[headerRank](this._label)]),
			ns.list(this.internallyApplicableSections, function (section) {
				return _if(section._hasFilledPropertyNamesDeep, section.toDOM(document, childOptions));
			}));
	}));
