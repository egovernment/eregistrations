'use strict';

var _ = require('mano').i18n.bind('View: pause button')
  , normalizeOptions = require('es5-ext/object/normalize-options');

module.exports = function (step/*, options */) {
	var options = normalizeOptions(arguments[1]), isPaused = step._isPaused, label, businessProcess;
	label = _if(isPaused, options.unpauseLabel || _("Unpause"), options.pauseLabel || _("Pause"));
	businessProcess = step.master;

	return postButton({
		action: url(businessProcess.__id__, _if(isPaused, 'unpause', 'pause')),
		buttonClass: 'button-main',
		'data-hint': _("Pauses the processing of the application."),
		class: 'hint-optional hint-optional-bottom',
		value: label
	});
};
