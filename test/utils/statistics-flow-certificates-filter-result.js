'use strict';

module.exports = function (t, a) {
	var expected, inputMap = {
		"2016-01-02": {
			serviceA: {
				businessProcess: {
					pending: 33,
					submitted: 5,
					sentBack: 40,
					rejected: 2
				},
				certificate: {
					certA: {
						submitted: 20,
						pending: 32
					},
					certB: {
						submitted: 25,
						pending: 14
					}
				}
			},
			serviceB: {
				businessProcess: {
					pending: 12,
					sentBack: 4,
					rejected: 0
				},
				certificate: {
					certA: {
						submitted: 5,
						pending: 10
					},
					certB: {
						submitted: 13,
						pending: 22
					}
				}
			}
		}
	};
	expected = {
		"2016-01-02": {
			submitted: 5,
			pending: 45,
			pickup: 0,
			withdrawn: 0,
			rejected: 2,
			sentBack: 44
		}
	};
	a.deep(t(inputMap, {}), expected);

	expected = {
		"2016-01-02": {
			submitted: 5,
			pending: 33,
			pickup: 0,
			withdrawn: 0,
			rejected: 2,
			sentBack: 40
		}
	};
  // service
	a.deep(t(inputMap, { service: 'serviceA' }), expected);
	// certificate
	expected = {
		"2016-01-02": {
			submitted: 25,
			pending: 42,
			pickup: 0,
			withdrawn: 0,
			rejected: 0,
			sentBack: 0
		}
	};
	a.deep(t(inputMap, { certificate: 'certA' }), expected);
};
