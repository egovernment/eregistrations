// Computes sizes of two collections
// - (submittedBusinessProcessesSize) count of all submitted business process of given user
// - (dependentManagedUsersSize) count of all clients which depend on existence of manager
//
// It's needed for proper computation of canBeDestroyed (client or manager) properties

'use strict';

var deferred                   = require('deferred')
  , ensureDriver               = require('dbjs-persistence/ensure-driver')
  , businessProcessUserMap     = require('mano/lib/server/business-process-user-map')
  , clientManagerMap           = require('mano/lib/server/client-manager-map')
  , getDbSet                   = require('../utils/get-db-set')
  , trackRelationsSize         = require('../utils/track-relations-size')
  , getBusinessProcessStorages = require('../utils/business-process-storages');

module.exports = function (driver) {
	var userStorage = ensureDriver(driver).getStorage('user');

	return deferred(
		trackRelationsSize(
			'submittedBusinessProcessesSize',
			getBusinessProcessStorages()(function (businessProcessStorages) {
				return getDbSet(businessProcessStorages, 'direct', 'isSubmitted', '11');
			}),
			businessProcessUserMap
		),
		trackRelationsSize(
			'dependentManagedUsersSize',
			getDbSet(userStorage, 'computed', 'isManagerDestructionBlocker', '11'),
			clientManagerMap
		)
	);
};
