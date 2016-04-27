'use strict';

var d              = require('d')
  , _              = require('mano').i18n.bind('View: Binding: Manager')
  , activeManagers = require('mano').db.User.instances.filterByKey('isManagerActive')
  , sortedManagers = activeManagers.toArray(function (a, b) {
	return a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());
});

module.exports = function (descriptor) {
	Object.defineProperties(descriptor, {
		inputOptions: d({
			list: sortedManagers,
			property: 'fullName',
			chooseLabel: _("Select manager:")
		})
	});
};
