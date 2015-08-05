'use strict';
var _  = require('mano').i18n.bind('Official: Precal');

exports._parent = require('print-base');

exports.main = require('./_official-print')(url, require('./_status-map'),
	require('./_default-sort'), _('Print'), 'print');
