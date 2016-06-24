'use strict';

var _           = require('mano').i18n.bind('View: Dispatcher')
  , appLocation = require('mano/lib/client/location');

module.exports = exports = require('eregistrations/view/dispatcher-base');

exports._dispatcherNav = function () {
	return [
		// Change this to real setup
		li({ id: "example-nav", class:
				_if(eq(appLocation._pathname, '/'), 'pills-nav-active') },
			a({ href: '/', class: 'pills-nav-pill' }, _("Example")))
	];
};
