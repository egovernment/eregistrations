// Defines payment receipt uploads on business process certificates map

'use strict';

var ensureArray                 = require('es5-ext/array/valid-array')
  , copy                        = require('es5-ext/object/copy')
  , forEach                     = require('es5-ext/object/for-each')
  , ensureObject                = require('es5-ext/object/valid-object')
  , ensureType                  = require('dbjs/valid-dbjs-type')
  , definePaymentReceiptUploads = require('../payment-receipt-uploads')

  , create = Object.create, keys = Object.keys, stringify = JSON.stringify;

module.exports = function (BusinessProcess, data) {
	var db = ensureType(BusinessProcess).database, definitions = create(null);
	definePaymentReceiptUploads(db);
	keys(ensureObject(data)).forEach(function (name) { definitions[name] = { nested: true }; });
	BusinessProcess.prototype.paymentReceiptUploads.map.defineProperties(definitions);
	forEach(data, function (props, name) {
		var costs = props.costs;
		if (costs == null) {
			if (!BusinessProcess.prototype.costs.map[name]) {
				throw new Error("No costs provided, and there's no " + stringify(name) + " cost defined");
			}
			costs = [BusinessProcess.prototype.costs.map[name]];
		} else {
			ensureArray(costs);
			if (!costs.length) throw new Error("At least one cost should be provided");
			costs.forEach(function (cost) {
				ensureObject(cost);
				if (cost.owner !== BusinessProcess.prototype.costs.map) {
					throw new Error("Provided " + stringify(name) +
						" cost doesn't come from BusinessProcess.prototype.costs.map");
				}
			});
		}
		this[name].costs = new Function('var costs = this.master.costs.map;\nreturn [' +
			costs.map(function (cost) { return 'costs.' + cost.key; }) + '];\n');
		props = copy(props);
		delete props.costs;
		this[name].document.setProperties(props);
	}, BusinessProcess.prototype.paymentReceiptUploads.map);
	return BusinessProcess;
};
