'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , getDbSet         = require('eregistrations/server/utils/get-db-set')
  , deferred         = require('deferred')
  , aFrom            = require('es5-ext/array/from')
  , debug            = require('debug-ext')('auto-assign');

module.exports = function (businessProcessStorage, counterStorage, officials, step/*, options*/) {
	var options = normalizeOptions(arguments[4])
	  , id      = step.shortPath
	  , path    = step.__id__.slice(step.master.__id__.length + 1)
	  , officialsArray, lastIndex;

	officialsArray = officials.toArray();

	var addAssignee = function (businessProcessId) {
		var recordId = businessProcessId + '/' + path + '/assignee';
		return businessProcessStorage.get(recordId)(function (data) {
			var officialId;
			if (data && data.value[0] === '7') return;
			lastIndex = officialsArray[lastIndex + 1] ? lastIndex + 1 : 0;
			officialId = officialsArray[lastIndex];
			debug('for %s assigned id: %s, to %s', id, officialId, businessProcessId);
			return deferred(
				businessProcessStorage.store(businessProcessId + '/' + path + '/assignee',
					'7' + officialId),
				counterStorage.store('processingStepAutoAssignLastIndex/' + id, serializeValue(lastIndex))
			)(function () {
				if (options.onAssign) return options.onAssign(officialId);
			});
		});
	};

	return counterStorage.get('processingStepAutoAssignLastIndex/' + id)(function (data) {
		return (data && unserializeValue(data.value)) || 0;
	}).then(function (index) {
		lastIndex = index;
		return getDbSet(
			businessProcessStorage,
			'computed',
			path + '/resolvedStatus',
			serializeValue('pending')
		)(function (businessProcesses) {
			var listener = function (ev) {
				if (ev.type === 'delete') return;
				if (ev.type === 'add') {
					addAssignee(ev.value).done();
					return;
				}
				if (ev.type === 'batch') {
					if (!ev.added) return;
					deferred.map(aFrom(ev.added), addAssignee).done();
					return;
				}

				throw new Error("Unsupported event: " + ev.type);
			};
			var activate = function () {
				businessProcesses.on('change', listener);
				return deferred.map(aFrom(businessProcesses), addAssignee);
			};
			var deactivate = function () {
				businessProcesses.off('change', listener);
			};
			if (officials.size) return activate();
			officials._size.on('change', function (event) {
				if (event.newValue) {
					if (!event.oldValue) activate().done();
				} else if (event.oldValue) {
					deactivate();
				}
			});
		});
	});
};
