// Extends business processes states meta data with object collections

'use strict';

var all  = require('./')
  , meta = require('./meta');

module.exports = meta;

meta.all.data      = all;
meta.pending.data  = all.filterByKeyPath('processingSteps/map/{ $appNameSuffix }/isPending', true);
meta.sentBack.data = all.filterByKey('processingSteps/map/{ $appNameSuffix }/isSentBack', true);
meta.rejected.data = all.filterByKey('processingSteps/map/{ $appNameSuffix }/isRejected', true);
meta.approved.data = all.filterByKey('processingSteps/map/{ $appNameSuffix }/isApproved', true);
