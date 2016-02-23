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
			return this.isApproved;
		} },
		derivedFrom: {
			type: BusinessProcess,
			reverse: 'derivatives'
		},
		/**
		 * @param {BusinessProcess} businessProcess
		 * @returns undefined
		 */
		derive: {
			type: db.Function,
			value: function (businessProcess) {
				if (!(businessProcess instanceof this.database.BusinessProcess)) {
					throw new TypeError((businessProcess ? businessProcess.__id__ : businessProcess) +
						' cannot be derived, instance of BusinessProcess is expected');
				}
				if (!this.canBeDerivationSource) {
					throw new Error(this.__id__ +
						' cannot have derivatives');
				}
				businessProcess.derivedFrom = this;
			}
		}
	});

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
