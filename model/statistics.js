// Statistics data holder

'use strict';

var ensureDatabase = require('dbjs/valid-dbjs')
  , defineUInteger = require('dbjs-ext/number/integer/u-integer');

module.exports = function (db) {
	var UInteger    = defineUInteger(db)
	  , statistics = ensureDatabase(db).Object.newNamed('statistics');

	statistics.defineProperties({
		businessProcess: { nested: true, type: db.Object },
		user: { nested: true, type: db.Object }
	});

	// Business process stats
	var StatisticsBusinessProcess = db.Object.extend('StatisticsBusinessProcess');
	statistics.businessProcess._descriptorPrototype_.type = StatisticsBusinessProcess;
	StatisticsBusinessProcess.prototype.defineProperties({
		atPartA: { nested: true, type: db.Object },
		atPartB: { nested: true, type: db.Object },
		pending: { type: UInteger },
		sentBack: { type: UInteger },
		rejected: { type: UInteger },
		approved: { type: UInteger },
		certificate: { nested: true, type: db.Object }
	});
	StatisticsBusinessProcess.prototype.atPartA.defineProperties({
		all: { type: UInteger },
		atGuide: { type: UInteger },
		guideComplete: { nested: true, type: db.Object }
	});
	StatisticsBusinessProcess.prototype.atPartA.guideComplete.defineProperties({
		all: { type: UInteger },
		dataFormsComplete: { type: UInteger },
		requirementUploadsComplete: { type: UInteger },
		paymentComplete: { type: UInteger },
		atSend: { type: UInteger }
	});
	var StatisticsBusinessProcessProcessingStep
		= db.Object.extend('StatisticsBusinessProcessProcessingStep');
	StatisticsBusinessProcess.prototype.atPartB._descriptorPrototype_.type =
		StatisticsBusinessProcessProcessingStep;
	StatisticsBusinessProcessProcessingStep.prototype.defineProperties({
		pending: { type: UInteger },
		sentBack: { type: UInteger },
		redelegated: { type: UInteger },
		rejected: { type: UInteger },
		approved: { type: UInteger }
	});
	// Certificate stats
	var StatisticsBusinessProcessCertificate
		= db.Object.extend('StatisticsBusinessProcessCertificate');
	StatisticsBusinessProcess.prototype.certificate._descriptorPrototype_.type =
		StatisticsBusinessProcessProcessingStep;
	StatisticsBusinessProcessCertificate.prototype.defineProperties({
		waiting: { type: UInteger },
		pending: { type: UInteger },
		rejected: { type: UInteger },
		approved: { type: UInteger }
	});

	// User stats
	statistics.user.defineProperties({
		accounts: { nested: true, type: db.Object },
		demo: { type: UInteger }
	});
	statistics.user.accounts.defineProperties({
		all: { type: UInteger },
		user: { type: UInteger },
		manager: { nested: true, type: db.Object },
		official: { nested: true, type: db.Object },
		admin: { nested: true, type: db.Object }
	});
	statistics.user.accounts.manager.defineProperties({
		active: { type: UInteger },
		inactive: { type: UInteger }
	});
	statistics.user.accounts.official._descriptorPrototype_.type = UInteger;
	statistics.user.accounts.official.defineProperties({
		all: { type: UInteger }
	});
	statistics.user.accounts.admin.defineProperties({
		all: { type: UInteger },
		usersAdmin: { type: UInteger },
		metaAdmin: { type: UInteger },
		dispatcher: { type: UInteger },
		supervisor: { type: UInteger }
	});

	return statistics;
};
