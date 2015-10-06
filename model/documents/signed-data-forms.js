'use strict';

var memoize          = require('memoizee/plain')
  , ensureDb          = require('dbjs/valid-dbjs')
  , _                = require('mano').i18n.bind('Model: SignedDataForms')
  , defineDocument   = require('../document');

module.exports = memoize(function (db) {
	var Document = defineDocument(ensureDb(db));

	return Document.extend('SignedDataForms', {
		isUpToDate: {
			type: db.Boolean,
			value: function (_observe) {
				var sections, lastEditStamp;
				if (!this.isUpToDateByUser) return false;
				sections = _observe(this.master.dataForms.applicable).copy().add(this.master.determinants);
				lastEditStamp = 0;

				// Find out the last edit date of the form sections.
				sections.forEach(function (section) {
					lastEditStamp = Math.max(lastEditStamp, _observe(section._lastEditStamp));
				}, this);

				_observe(this.files.ordered).forEach(function (file) {
					lastEditStamp = Math.max(lastEditStamp,
						_observe(file.getDescriptor('path').lastModified));
				});

				// If any section has been modified later than
				// isUpToDateByUser, the user value must be invalidated.
				return lastEditStamp < _observe(this._isUpToDateByUser._lastModified);
			}
		},

		isUpToDateByUser: {
			type: db.Boolean,
			value: false,
			label: _('Is signed application form up to date?')
		}
	}, {
		// Document label
		label: { value: _("Signed registration form") }
	});
}, { normalizer: require('memoizee/normalizers/get-1')() });
