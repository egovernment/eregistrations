'use strict';

var memoize          = require('memoizee/plain')
  , ensureType       = require('dbjs/valid-dbjs-type')
  , _                = require('mano').i18n.bind('Model: FormUpToDateConfirmation')
  , defineDocument   = require('../document');

module.exports = memoize(function (db/*, options */) {
	var options, Parent;
	options = Object(arguments[1]);
	if (options.parent) {
		Parent = ensureType(options.parent);
	} else {
		Parent = defineDocument(db);
	}

	return Parent.extend('FormUpToDateConfirmation', {
		isSignedFormFilesUpToDate: {
			type: db.Boolean,
			value: function (_observe) {
				if (!this.isSignedFormFilesUpToDateUserValue) return false;

				var lastEditStamp = 0;
				// Find out the last edit date of the form sections.
				this.master.dataForms.map.forEach(function (section) {
					lastEditStamp = Math.max(lastEditStamp, _observe(section._lastEditStamp));
				}, this);

				// If any section has been modified later than
				// isSignedFormFilesUpToDateUserValue, the user value must be invalidated.
				return lastEditStamp < _observe(this._isSignedFormFilesUpToDateUserValue._lastModified);
			}
		},

		isSignedFormFilesUpToDateUserValue: {
			type: db.Boolean,
			value: false,
			label: _('Is signed application form up to date?'),
			trueLabel: _('Yes'),
			falseLabel: _('No')
		}
	}, {
		// Document label
		label: { value: _("Signed registration form") }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
