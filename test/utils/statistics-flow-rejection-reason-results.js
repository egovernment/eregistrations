'use strict';

module.exports = function (t, a) {
	var expected, inputArray = [
		{
			hasOnlySystemicReasons: false,
			rejectionType: "rejected",
			rejectionReasons: [
				{
					types: [
						"other"
					],
					value: "not good",
					ownerType: "processingStep",
					path: ""
				},
				{
					types: [
						"illegible",
						"invalid"
					],
					value: "",
					ownerType: "requirementUpload",
					path: "/requirementUploads/map/passport"
				},
				{
					types: [
						"other"
					],
					value: "junk",
					ownerType: "requirementUpload",
					path: "/requirementUploads/map/electricityBill"
				}
			],
			service: {
				type: "BusinessProcessMerchant",
				id: "11bfwele0k21",
				businessName: "John Doe"
			},
			operator: {
				id: "218nvxux6gor",
				name: "John Doe"
			},
			processingStep: {
				path: "/processingSteps/map/revision",
				label: "Revision"
			},
			occurancesCount: 0,
			date: {
				ts: 1493307837863,
				date: 1493251200000
			}
		}];
	expected = [[
		[
			'other',
			'not good',
			'illegible',
			'invalid',
			'other',
			'junk'
		],
		'',
		'',
		'John Doe',
		'Revision',
		'27/4/2017',
		'John Doe'
	]];
	a.deep(t(inputArray), expected);
};
