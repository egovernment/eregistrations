'use strict';

var d = require('d')
  , activeManagers = require('../../users/active-managers')
  , _ = require('mano').i18n.bind('View: Manager Select');

module.exports = function (descriptor) {
	Object.defineProperties(descriptor, {
		inputOptions: d({
			list: activeManagers.toArray(function (a, b) {
				return a.fullName.toLowerCase().localeCompare(b.fullName.toLowerCase());
			}),
			property: 'fullName',
			chooseLabel: _("Select manager:")
		})
	});
};
