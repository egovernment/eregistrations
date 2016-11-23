//Initialisation of ${ className } class (a business process service)

'use strict';

var _ = require('../../i18n').bind('Model: ${ className }');

module.exports = require('../business-process/base').extend('${ className }', {
	label: _("TODO: Provide label for this service")
});
