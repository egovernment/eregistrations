'use strict';

var location       = require('mano/lib/client/location')
  , modes          = require('../../../utils/statistics-flow-group-modes')
  , generateScript = require('dom-ext/html-document/#/generate-inline-script')
  , inlineButtonGroupHandlerScript =
		require('../../dbjs/inline-button-group/class-handler-script');

module.exports = function (/* opts */) {
	var opts, name, id, modeQuery;
	opts         = Object(arguments[0]);
	name         = opts.name || 'mode';
	id           = opts.id || "mode-selection";
	modeQuery    = location.query.get(name);

	return div({ class: "input", id: id },
		div({ class: "inline-button-radio" },
			list(modes, function (mode) {
				label(
					input({
						type: "radio",
						name: "mode",
						value: mode.key,
						checked: modeQuery.map(function (value) {
							if (!value) value = 'daily';
							var checked = (mode.key ? (value === mode.key) : (value == null));
							return checked ? 'checked' : null;
						})
					}),
					mode.label
				);
			})), generateScript.call(document, inlineButtonGroupHandlerScript, id));
};
