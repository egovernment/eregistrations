// List of static properties used in business process table columns

'use strict';

var Set = require('es6-set');

module.exports = new Set([
	'certificates/dataSnapshot/jsonString', 'filesArchiveUrl',
	'isApproved', 'isRejected', 'isSubmitted', 'pickupDate'
]);
