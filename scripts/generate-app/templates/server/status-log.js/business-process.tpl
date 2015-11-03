'use strict';

var _ = require('mano').i18n.bind('User')
  , ${ className } = require('mano').db.${ className };

module.exports = [{
	BusinessProcessType: ${ className },
	trigger: 'isSubmitted',
	label: _('Request'),
	text: _('Request received')
}];
