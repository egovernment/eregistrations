"use strict";

var db               = require('mano').db
  , _                = require('mano').i18n.bind('User')
  , d                = require('d')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , SectionType      = db.User.prototype.dataForm.sections.getDescriptor('profile').type;

module.exports = Object.defineProperty(db.User.prototype.dataForm.sections.profile,
	'toDOMFieldset', d(function (document/*, options*/) {
		var options = normalizeOptions(arguments[1]);
		options.fieldsetAppend = [li(field({ label: _("Repeat password"), dbjs: db.Password,
			required: this.master === db.User.prototype ? true : false, name: 'password-repeat' }))];

		return SectionType.prototype.toDOMFieldset.call(this, document, options);
	}));
