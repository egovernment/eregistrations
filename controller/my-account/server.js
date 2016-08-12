// Server specific controller.

'use strict';

var assign    = require('es5-ext/object/assign')
  , dbObjects = require('mano').db.objects;

// Common
assign(exports, require('../user/server'));

exports['business-process/[0-9][a-z0-9]+/delete'] = {
	submit: function () {
		var previous = this.businessProcess.previousBusinessProcess;
		dbObjects.delete(this.businessProcess);
		// If it's business update based on business process not coming from eRegistrations
		// then ensure to also delete that base businessProcess
		if (previous && !previous.isFromEregistrations) dbObjects.delete(previous);
	}
};

exports.register = require('../demo-user-server-controller')().register;
