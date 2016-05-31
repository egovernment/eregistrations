'use strict';

var d                        = require('d'),
	db                       = require('mano').db,
	BusinessActivity         = db.BusinessActivity,
	BusinessActivityCategory = db.BusinessActivityCategory.meta;

Object.defineProperties(BusinessActivity, {
	inputOptions: d({
		group: {
			propertyName: 'category',
			labelPropertyName: 'label',
			set: BusinessActivityCategory
		},
		property: 'label',
		chooseLabel: "Choose your activity:"
	})
});
