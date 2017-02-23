'use strict';

var db                    = require('../../db')
  , defineBusinessProcess = require('../../model/business-process')
  , processingSteps       = require('../../processing-steps-meta')
  , assign                = require('es5-ext/object/assign')
  , d                     = require('d');

module.exports = function (t, a) {
	var expected, inputMap = {
		"2016-01-02": {
			serviceA: {
				stepA: {
					pending: {
						businessProcess: 16,
						certificate: {
							certA: 5,
							certB: 6
						}
					},
					approved: {
						businessProcess: 25,
						certificate: {
							certA: 12,
							certB: 6
						}
					},
					rejected: {
						businessProcess: 1,
						certificate: {
							certA: 1,
							certB: 0
						}
					}
				}
			},
			serviceB: {
				stepA: {
					pending: {
						businessProcess: 3,
						certificate: {
							certA: 3,
							certB: 5
						}
					},
					approved: {
						businessProcess: 13,
						certificate: {
							certA: 3
						}
					},
					rejected: {
						businessProcess: 0,
						certificate: {
							certB: 3
						}
					}
				},
				stepB: {
					approved: {
						businessProcess: 5,
						certificate: {}
					}
				}
			}
		}
	};
	if (!db.BusinessProcess) defineBusinessProcess(db);
	db.BusinessProcess.extend('BusinessProcessServiceA');
	db.BusinessProcess.extend('BusinessProcessServiceB');

	assign(processingSteps, {
		stepA: Object.defineProperty({
			pending: {},
			approved: {},
			rejected: {},
			sentBack: {},
			paused: {}
		}, '_services', d(['serviceA', 'serviceB'])),
		stepB: Object.defineProperty({
			pending: {},
			approved: {}
		}, '_services', d(['serviceB']))
	});

	expected = {
		"2016-01-02": {
			stepA: 19,
			stepB: 0
		}
	};
	a.deep(t(inputMap, { status: 'pending' }), expected);

	expected = {
		"2016-01-02": {
			stepA: 16,
			stepB: null
		}
	};
	// service
	a.deep(t(inputMap, { service: 'serviceA', status: 'pending' }), expected);
	// certificate
	expected = {
		"2016-01-02": {
			stepA: 15,
			stepB: 0
		}
	};
	a.deep(t(inputMap, { status: 'approved', certificate: 'certA' }), expected);
	expected = {
		"2016-01-02": {
			stepA: 1
		}
	};
	a.deep(t(inputMap, { status: 'rejected' }), expected);
};
