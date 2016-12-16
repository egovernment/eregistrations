// Standard matcher for inspector app routes.

'use strict';

var db          = require('mano').db
  , xhrGet      = require('mano/lib/client/xhr-driver').get
  , serverSync  = require('mano/lib/client/server-sync')
  , deferred    = require('deferred')
  , baseMatcher;

baseMatcher = function (businessProcessId) {
	this.businessProcess = db.BusinessProcess.getById(businessProcessId);

	return Boolean(this.businessProcess);
};

module.exports = function (step) {
	return function (businessProcessId) {
		var resolution = baseMatcher.call(this, businessProcessId)
		  , visitedBusinessProcesses;

		if (!resolution || !this.businessProcess.dataForms.dataSnapshot.jsonString) {
			document.body.classList.add('throbber-active');
			return xhrGet('/get-business-process-data/', { id: businessProcessId })(function (result) {
				var def, interval;
				if (!result.passed) return false;
				if (baseMatcher.call(this, businessProcessId)) return true;
				def = deferred();
				serverSync.once('sync', function () {
					var baseResolution;
					if (def.promise.resolved) return;
					clearInterval(interval);
					baseResolution = baseMatcher.call(this, businessProcessId);
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
					var baseResolution = baseMatcher.call(this, businessProcessId);
					if (!baseResolution) return;
					clearInterval(interval);
					def.resolve(baseResolution);
				}.bind(this), 1000);
				return def.promise;
			}.bind(this)).finally(function () { document.body.classList.remove('throbber-active'); });
		}

		visitedBusinessProcesses = this.user.recentlyVisited.businessProcesses.inspector;

		if (visitedBusinessProcesses.last !== this.businessProcess) {
			visitedBusinessProcesses.add(this.businessProcess);
		}

		return deferred(true);
	};
};
