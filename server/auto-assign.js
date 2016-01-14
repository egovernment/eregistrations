'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , getDbSet         = require('eregistrations/server/utils/get-db-set');

module.exports = function (storage, officials, step) {
	var id = step.shortPath, officialsArray, lastIndex,
		path = step.__id__.slice(step.master.__id__.length + 1);

	officialsArray = officials.toArray();

	var addAssignee = function (businessProcessId) {
		return storage.get(businessProcessId + '/' + path + '/assignee')(function (data) {
			if (data && data.value[0] === '7') return;
			var officialId, nextIndex;
			nextIndex = officialsArray[lastIndex + 1] ? lastIndex + 1 : 0;
			officialId = officialsArray[nextIndex];
			storage.db.ProcessingStep.resolveSKeyPath(businessProcessId + '/' + path).value.assignee =
				storage.db.User.getById(officialId);
			storage.store('processingStepAutoAssignLastIndex/' + id, serializeValue(nextIndex));
//      Use the below two lines once dbjs listens to storage changes
//      storage.store(businessProcessId + '/' + path + '/assignee', 7 + officialId)(function () {
//      storage.store('processingStepAutoAssignLastIndex/' + id, serializeValue(nextIndex));
		});
	};

	storage.get('processingStepAutoAssignLastIndex/' + id)(function (data) {
		return (data && unserializeValue(data.value)) || 0;
	}).then(function (index) {
		lastIndex = index;
		getDbSet('computed', path + '/resolvedStatus',
			serializeValue('pending'))(function (businessProcesses) {
			businessProcesses.on('change', function (ev) {
				if (ev.type === 'delete') return;
				if (ev.type === 'add') {
					addAssignee(ev.value);
					return;
				}
				if (ev.type === 'batch') {
					if (!ev.added) return;
					ev.added.forEach(addAssignee);
					return;
				}

				throw new Error("Unsupported event: " + ev.type);
			});

			businessProcesses.forEach(addAssignee);
		});
	});
};
