// Relations between business processes
// Derived business process is an update to already closed business process

'use strict';

var memoize               = require('memoizee/plain')
  , defineBusinessProcess = require('./flow');

module.exports = memoize(function (db/*, options*/) {
	var BusinessProcess = defineBusinessProcess(db, arguments[1]);

	BusinessProcess.prototype.defineProperties({
		// Whether given businessProcess can be a derivation source
		canBeDerivationSource: { type: db.Boolean, value: function (_observe) {
			if (!this.isClosed) return false;
			return !this.isRejected;
		} },
		derivedFrom: {
			type: BusinessProcess,
			reverse: 'derivatives'
		},
		/**
		 * @param {BusinessProcess} businessProcess
		 * @returns {Boolean} - true on success, false otherwise
		 */
		derive: {
			type: db.Function,
			value: function (businessProcess) {
				if (!(businessProcess instanceof this.database.BusinessProcess)) {
					throw new Error((businessProcess ? businessProcess.__id__ : businessProcess) +
						' cannot be derived, instance of BusinessProcess is expected');
				}
				if (!this.canBeDerivationSource) return false;
				businessProcess.derivedFrom = this;
				return true;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
