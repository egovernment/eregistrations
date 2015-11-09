// Server side registration controller used by Demo users.

'use strict';

module.exports = function (controllers) {
	controllers.register = {
		submit: function (normalizedData, data) {
			this.user.delete('isDemo');

			return controllers.profile.submit.apply(this, arguments);
		}
	};
};
