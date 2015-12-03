// Standard matcher for official apps routes.
'use strict';

var db          = require('mano').db
  , xhrGet      = require('mano/lib/client/xhr-driver').get
  , serverSync  = require('mano/lib/client/server-sync')
  , deferred    = require('deferred')
  , baseMatcher;

baseMatcher = function (step, businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (this.businessProcess) {
		if (typeof step === 'function') {
			this.processingStep = step.call(this);
		} else {
			this.processingStep = this.businessProcess.processingSteps.map[step];
		}
		return this.processingStep && this.processingStep.isReady;
	}

	return false;
};

module.exports = function (step) {
	return function (businessProcessId) {
		var resolution = baseMatcher.call(this, step, businessProcessId), visitedBusinessProcesses;
		if (!resolution) {
			return xhrGet('/get-business-process-data/', { id: businessProcessId })(function (result) {
				var def;
				if (!result.passed) return false;
				if (baseMatcher.call(this, step, businessProcessId)) return true;
				def = deferred();
				serverSync.once('sync', function () {
					var baseResolution;
					baseResolution = baseMatcher.call(this, step, businessProcessId);
					if (!baseResolution) {
						def.reject(new Error("Data sync issue"));
						return;
					}
					def.resolve(baseResolution);
				}.bind(this));
				return def.promise;
			}.bind(this));
		}
		if (db.ProcessingStepGroup && this.processingStep.parentGroup) {
			visitedBusinessProcesses =
				this.user.visitedBusinessProcesses[this.processingStep.parentGroup.key][
					this.processingStep.key
				];
		} else {
			visitedBusinessProcesses = this.user.visitedBusinessProcesses[this.processingStep.key];
		}

		if (visitedBusinessProcesses.last !== this.businessProcess) {
			visitedBusinessProcesses.add(this.businessProcess);
		}
		return deferred(true);
	};
};
