'use strict';

var db = require('mano').db
  , customError = require('es5-ext/error/custom');

module.exports = function (data) {
	var businessProcess;
	if (!data.initialProcess) {
		throw customError("Wrong post data", 'WRONG_POST_DATA');
	}
	if (data.initialProcess === 'notRegistered') {
		this.derivationSource = null;
		return true;
	}

	businessProcess = db.BusinessProcess.getById(data.initialProcess);
	if (!businessProcess.canBeDerivationSource) {
		throw customError("This business process cannot be a derivation source",
			'CANNOT_BE_DERIVATION_SOURCE');
	}
	this.derivationSource = businessProcess;
	return true;
};
