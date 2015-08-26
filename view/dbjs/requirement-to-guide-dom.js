/** Renders the default view for instances of Requirement
 * @param document {object} - document object, usually DOM
 * @returns {string} - label of a requirement object
 */

'use strict';

var db = require('mano').db
  , d  = require('d');

module.exports = Object.defineProperty(db.Requirement.prototype, 'toGuideDOM',
	d(function (document/*, options */) {
		return this.label;
	}));
