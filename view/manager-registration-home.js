'use strict';

var _                    = require('mano').i18n.bind('View: Manager')
  , generateFormSections = require('./components/generate-form-sections');

exports._parent = require('./user-base');

exports['sub-main'] = function () {
	div(
		{ class: 'user-forms content' },
		exports._managerSectionsHeading.call(this),
		generateFormSections(this.user.managerDataForms.applicable)
	);
};

exports._managerSectionsHeading = function () {
	return div(
		{ class: 'info-main' },
		p(_("Please complete your profile to proceed."))
	);
};
