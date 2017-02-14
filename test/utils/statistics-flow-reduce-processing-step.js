'use strict';

module.exports = function (t, a) {
	var expected, inputMap = {
		"2016-01-02": {
			serviceA: {
				businessProcess: {
					pending: 33,
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
				},
				processingStep: {
					stepA: {
						pending: {
							businessProcess: 16,
							certificate: {
								certA: 5,
								certB: 6
							}
						},
						byProcessor: {
							// processor id
							'7464567456': {
								approved: {
									businessProcess: 13,
									certificate: {
										certA: 2,
										certB: 4
									}
								},
								rejected: {
									businessProcess: 0,
									certificate: {
										certA: 0,
										certB: 0
									}
								}
							},
							'52345234': {
								approved: {
									businessProcess: 12,
									certificate: {
										certA: 10,
										certB: 2
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
						}
					}
				}
			}
		}
	};
	expected = {
		"2016-01-02": {
			serviceA: {
				processingStep: {
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
				}
			}
		}
	};
	a.deep(t(inputMap), expected);
};
