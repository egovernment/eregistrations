'use strict';

var db = require('mano').db

  , user = db.User.prototype;

exports.main = function () {
	section(form(h2("Section A"),
		fieldset({ dbjs: user, names: ['firstName', 'lastName', 'dateOfBirth', 'userEmail'] })));

	section(form(h2("Section B"),
		fieldset({ dbjs: user, names: ['companyType', 'members', 'inventory', 'surfaceArea', 'isOwner',
			'businessActivity', 'registerIds'],
			controls: { businessActivity: { disabled: true, property: 'label',
				group: {
					propertyName: 'category',
					labelPropertyName: 'label'
				} } } })));
};
