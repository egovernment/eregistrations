// Standard matcher for official apps routes.

'use strict';

var db          = require('mano').db
  , xhrGet      = require('mano/lib/client/xhr-driver').get
  , serverSync  = require('mano/lib/client/server-sync')
  , deferred    = require('deferred')
  , baseMatcher;

baseMatcher = function (step, businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	if (!this.businessProcess) return false;

	// Below check is a hack through which we ensure that business process has full data loaded
	// (we don't want to show the page to user until that's the case)
	if (!this.businessProcess.dataForms.dataSnapshot.jsonString) return false;

	if (step === false) return this.businessProcess.isSubmitted;

	if (typeof step === 'function') {
		this.processingStep = step.call(this);
	} else {
		this.processingStep = this.businessProcess.processingSteps.map[step];
	}
	if (!this.processingStep) return false;

	return this.processingStep.isReady;
};

module.exports = function (step) {
	return function (businessProcessId) {
		var resolution = baseMatcher.call(this, step, businessProcessId), visitedBusinessProcesses;
		if (!resolution) {
			document.body.classList.add('throbber-active');
			return xhrGet('/get-business-process-data/', { id: businessProcessId })(function (result) {
				var def, interval;
				if (!result.passed) return false;
				if (baseMatcher.call(this, step, businessProcessId)) return true;
				def = deferred();
				serverSync.once('sync', function () {
					var baseResolution;
					if (def.promise.resolved) return;
					clearInterval(interval);
					baseResolution = baseMatcher.call(this, step, businessProcessId);
					if (!baseResolution) {
						console.error("Data sync issue");
						def.resolve(false);
						return;
					}
					def.resolve(baseResolution);
				}.bind(this));
				// 'sync' will be emitted only if updates go to current tab,
				// so if SSE connection is handled by other tab, we may end with infinte wait
				// to we avoid that, following check on interval is done
				interval = setInterval(function () {
					var baseResolution = baseMatcher.call(this, step, businessProcessId);
					if (!baseResolution) return;
					clearInterval(interval);
					def.resolve(baseResolution);
				}.bind(this), 1000);
				return def.promise;
			}.bind(this)).finally(function () { document.body.classList.remove('throbber-active'); });
		}
		if (this.user.currentRoleResolved === 'dispatcher') {
			visitedBusinessProcesses = this.user.recentlyVisited.businessProcesses.dispatcher;
		} else if (this.user.currentRoleResolved === 'supervisor') {
			visitedBusinessProcesses = this.user.recentlyVisited.businessProcesses.supervisor;
		} else if (db.ProcessingStepGroup && this.processingStep.parentGroup) {
			visitedBusinessProcesses =
				this.user.recentlyVisited.businessProcesses[this.processingStep.parentGroup.key][
					this.processingStep.key
				];
		} else {
			visitedBusinessProcesses =
				this.user.recentlyVisited.businessProcesses[this.processingStep.key];
		}

		if (visitedBusinessProcesses.last !== this.businessProcess) {
			visitedBusinessProcesses.add(this.businessProcess);
		}
		return deferred(true);
	};
};
