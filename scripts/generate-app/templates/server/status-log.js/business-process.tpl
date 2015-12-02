'use strict';

var _ = require('../../../i18n').bind('User')
  , ${ className } = require('../../../db').${ className };

module.exports = [{
	BusinessProcessType: ${ className },
	trigger: 'isSubmitted',
	label: _('Request'),
	text: _('Request received')
}];
