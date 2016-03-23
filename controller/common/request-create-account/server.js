'use strict';

var mano           = require('mano')
  , db             = mano.db
  , genId          = require('time-uuid')
  , _              = mano.i18n.bind("Authentication")
  , requestCreateManagedAccountMail =
		require('../../../server/email-notifications/request-create-managed-account')
  , queryMaster    = require('eregistrations/server/services/query-master/slave');

var sendCreateRequest = function (data) {
	requestCreateManagedAccountMail(data).done(null, function (err) {
		console.log(err.stack);
		console.error("Cannot send email");
	});
	return { message: _("The account creation request has been sent.") };
};

exports['request-create-account/[0-9][a-z0-9]+'] = {
	match: function (userId) {
		this.target = db.User.getById(userId);
		if (!this.manager) return;
		if (this.manager.currentlyManagedUser !== this.target) return;
		return this.target;
	},
	submit: function (data, normalizedData) {
		var mailerData = {}, targetId = this.target.__id__, currentEmail = this.target.email;

		mailerData       = {};
		mailerData.token = genId();
		mailerData.email = normalizedData[targetId + '/email'];

		if (!currentEmail || (normalizedData[targetId + '/email'] !== currentEmail)) {
			return queryMaster('ensureEmailNotTaken', {
				email: normalizedData[targetId + '/email']
			}).then(function () {
				this.target.email                     = normalizedData[targetId + '/email'];
				this.target.createManagedAccountToken = mailerData.token;
				if (!this.target.isInvitationSent) {
					this.target.isInvitationSent = true;
				}
				return sendCreateRequest(mailerData);
			}.bind(this));
		}
		this.target.createManagedAccountToken = mailerData.token;
		if (!this.target.isInvitationSent) {
			this.target.isInvitationSent = true;
		}

		return sendCreateRequest(mailerData);
	}
};
