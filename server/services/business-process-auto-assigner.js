'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , getDbSet         = require('eregistrations/server/utils/get-db-set')
  , ensureStorage    = require('dbjs-persistence/ensure-storage')
  , deferred         = require('deferred')
  , aFrom            = require('es5-ext/array/from')
  , ensureCallable   = require('es5-ext/object/valid-callable')
  , idToStorage      = require('../utils/business-process-id-to-storage')
  , debug            = require('debug-ext')('auto-assign');

module.exports = function (businessProcessStorages, counterStorage, officials, step/*, options*/) {
	var options = normalizeOptions(arguments[4])
	  , id      = step.shortPath
	  , path    = step.__id__.slice(step.master.__id__.length + 1)
	  , customFilter    = options.customFilter && ensureCallable(options.customFilter)
	  , customIndexPath = options.customIndexPath
	  , officialsArray, lastIndex;
	if (Array.isArray(businessProcessStorages)) {
		businessProcessStorages = businessProcessStorages.map(ensureStorage);
	} else {
		businessProcessStorages = [ensureStorage(businessProcessStorages)];
	}

	officialsArray = officials.toArray();

	var addAssignee = function (businessProcessId) {
		var recordId = businessProcessId + '/' + path + '/assignee';

		return idToStorage(businessProcessId)(function (businessProcessStorage) {
			if (!businessProcessStorage) return;
			return businessProcessStorage.get(recordId)(function (data) {
				if (data && data.value[0] === '7') return;

				return deferred(customFilter ?
						customFilter(businessProcessStorage, businessProcessId) : true).then(function (isOK) {
					var officialId;
					if (!isOK) return;

					lastIndex = officialsArray[lastIndex + 1] ? lastIndex + 1 : 0;
					officialId = officialsArray[lastIndex];
					debug('for %s assigned official: %s, to process: %s', id, officialId, businessProcessId);
					return deferred(
						businessProcessStorage.store(businessProcessId + '/' + path + '/assignee',
								'7' + officialId),
						counterStorage.store('processingStepAutoAssignLastIndex/' +
							(customIndexPath || id), serializeValue(lastIndex))
					)(function () {
						if (options.onAssign) return options.onAssign(officialId);
					});
				});
			});
		});
	};

	return counterStorage.get('processingStepAutoAssignLastIndex/' + (customIndexPath || id)
		)(function (data) {
		return (data && unserializeValue(data.value)) || 0;
	}).then(function (index) {
		lastIndex = index;
		return getDbSet(
			businessProcessStorages,
			'computed',
			path + '/status',
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
