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
		derive: {
			type: db.Function,
			value: function (businessProcess) {
				if (!(businessProcess instanceof this.database.BusinessProcess)) {
					throw new Error(businessProcess.__id__ +
						' cannot be derived, instance of BusinessProcess is expected');
				}
				if (!this.canBeDerivationSource) return false;
				businessProcess.derivedFrom = this;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
