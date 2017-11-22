'use strict';

var env                    = require('mano').env
  , externalAuthentication = (env && env.externalAuthentication) || {};

module.exports = function (routes, canBeManaged) {
	if (externalAuthentication.profilePage) return;

	if (canBeManaged) {
		routes.profile = {
			view: require('../../view/user-profile'),
			decorateContext: function () {
				if (this.manager) {
					this.user = this.manager;
				}
			}
		};
	} else {
		routes.profile = require('../../view/user-profile');
	}
};
