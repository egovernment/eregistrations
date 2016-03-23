'use strict';

var submit            = require('mano/utils/save')
  , assign            = require('es5-ext/object/assign')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').submit
  , genId    = require('time-uuid')
  , mano     = require('mano')
  , requestCreateManagedAccountMail =
		require('../../server/email-notifications/request-create-managed-account')

  , _ = mano.i18n.bind("Authentication");

assign(exports, require('../common/managed-profile/server'),
	require('../common/request-create-account/server'));

exports.profile = {
	submit: function (normalizedData, data) {
		if (data.password || data['password-new']) return changeOwnPassword.apply(this, arguments);
		return submit.apply(this, arguments);
	}
};

exports['request-create-managed-account'] = {
	submit: function () {
		var data = { token: genId() };
		this.user.createManagedAccountToken = data.token;
		data.email                          = this.user.email;
		if (!this.user.isInvitationSent) {
			this.user.isInvitationSent = true;
		}

		requestCreateManagedAccountMail(data).done(null, function (err) {
			console.log(err.stack);
			console.error("Cannot send email");
		});
		return { message: _("The account creation request has been sent.") };
	}
};

// Active Business Process change
exports['change-business-process'] = {
	redirectUrl: '/'
};

exports['change-currently-managed-user'] = {
	redirectUrl: '/'
};
