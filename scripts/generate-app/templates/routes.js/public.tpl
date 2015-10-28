// Routes for the views.

'use strict';

var viewTree = require('./view');

module.exports = {
	'/': viewTree.home,
	'reset-password': viewTree['reset-password']
};
