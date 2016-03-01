'use strict';

var submit            = require('mano/utils/save')
  , changeOwnPassword = require('mano-auth/controller/server/change-own-password').submit
  , genId    = require('time-uuid')
  , mano     = require('mano')
  , requestCreateManagedAccountMail =
		require('../../server/email-notifications/request-create-managed-account')

  , _ = mano.i18n.bind("Authentication");

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
		this.user.isInvitationSent          = true;
		data.email                          = this.user.email;

		requestCreateManagedAccountMail(data);
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
