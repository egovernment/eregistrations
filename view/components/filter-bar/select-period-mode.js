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

	var modeMap = {};

	modeQuery.on('change', function (ev) {
		var val = ev.newValue || 'daily';
		Object.keys(modeMap).forEach(function (key) {
			modeMap[key].checked = (val === key ? 'checked' : null);
			$.dispatchEvent(modeMap[key], 'change');
		});
	});

	return div({ class: "input", id: id },
		div({ class: "inline-button-radio" },
			list(modes, function (mode, key) {
				label(
					modeMap[key] = input({
						type: "radio",
						name: "mode",
						value: key,
						checked: modeQuery.map(function (value) {
							if (!value) value = 'daily';
							var checked = (key ? (value === key) : (value == null));
							return checked ? 'checked' : null;
						})
					}),
					mode.label
				);
			})), generateScript.call(document, inlineButtonGroupHandlerScript, id));
};
