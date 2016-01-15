'use strict';

var unserializeValue = require('dbjs/_setup/unserialize/value')
  , serializeValue   = require('dbjs/_setup/serialize/value')
  , getDbSet         = require('eregistrations/server/utils/get-db-set')
  , deferred         = require('deferred')
  , aFrom            = require('es5-ext/array/from');

module.exports = function (storage, officials, step) {
	var id = step.shortPath, officialsArray, lastIndex,
		path = step.__id__.slice(step.master.__id__.length + 1);

	officialsArray = officials.toArray();

	var addAssignee = function (businessProcessId) {
		return storage.get(businessProcessId + '/' + path + '/assignee')(function (data) {
			if (data && data.value[0] === '7') return;
			if (!officialsArray.length) return;
			var officialId, businessProcess;
			lastIndex = officialsArray[lastIndex + 1] ? lastIndex + 1 : 0;
			officialId = officialsArray[lastIndex];
			businessProcess = storage.db.BusinessProcess.getById(businessProcessId);
			businessProcess.resolveSKeyPath(path).value.assignee =
				storage.db.User.getById(officialId);
//		Use the below once dbjs listens to storage changes
//    return storage.store(businessProcessId + '/'
//    + path + '/assignee', 7 + officialId)(function () {
			return storage.store('processingStepAutoAssignLastIndex/' + id, serializeValue(lastIndex));
//		});
		});
	};

	return storage.get('processingStepAutoAssignLastIndex/' + id)(function (data) {
		return (data && unserializeValue(data.value)) || 0;
	}).then(function (index) {
		lastIndex = index;
		return getDbSet('computed', path + '/resolvedStatus',
			serializeValue('pending'))(function (businessProcesses) {
			businessProcesses.on('change', function (ev) {
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
			});
			return deferred.map(aFrom(businessProcesses), addAssignee);
		});
	});
};
