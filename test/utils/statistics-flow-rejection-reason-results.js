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
			occurrencesCount: 0,
			date: {
				ts: 1493307837863,
				date: 1493251200000
			}
		}];
	expected = [[
		[
			'not good',
			'Document 1 - The document is unreadable',
			'Document 1 - The loaded document does not match the required document',
			'Document 2 - junk'
		],
		'',
		'',
		'John Doe',
		'Revision',
		'4/27/2017',
		'John Doe'
	]];
	a.deep(t(inputArray), expected);
};
