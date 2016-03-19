'use strict';

var d = require('d')
  , db = require('mano').db
  , _ = require('mano').i18n.bind('View: Manager Select');

module.exports = function (descriptor) {
	Object.defineProperties(descriptor, {
		inputOptions: d({
			list: db.User.instances.filterByKey('isManagerActive'),
			property: 'fullName',
			chooseLabel: _("Select manager:")
		})
	});
};
