// Configuration of URL routes.

'use strict';

var viewTree = require('./view');

module.exports = {
	'/': viewTree.home,
	contact: viewTree.contact,
	'reset-password': viewTree.resetpswd,
	servicios: viewTree.serviciosPresentacion
};
