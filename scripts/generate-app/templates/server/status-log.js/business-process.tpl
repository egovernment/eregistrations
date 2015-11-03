'use strict';

var _ = require('mano').i18n.bind('User')
  , ${ className } = require('../../../model/${ appName }/base');

module.exports = [{
	BusinessProcessType: ${ className },
	trigger: 'isSubmitted',
	label: _('Request'),
	text: _('Request received')
}];
