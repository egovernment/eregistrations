'use strict';

var last     = require('es5-ext/string/#/last')
  , template = require('es6-template-strings')
  , genId    = require('time-uuid')
  , mailer   = require('mano/lib/server/mailer')
  , mano     = require('mano')

  , _ = mano.i18n.bind("Authentication")
  , origin = mano.env.url
  , getUrl;

if (origin == null) throw new Error("Url not set in env.json");
if (last.call(origin) === '/') origin = String(origin).slice(0, -1);

getUrl = function (url, token, email) {
	return origin + url + '?token=' + token + '&email=' + email;
};

module.exports = function () {
	var token = genId();
	this.user.createManagedAccountToken = token;
	this.user.isInvitationSent          = true;

	mailer({
		to: this.user.email,
		subject: _("Create account request"),
		text: template(_("To create account please visit: ${url}"),
			{ url: getUrl('/create-managed-account/', token, this.user.email) })
	});
	return { message: _("The account creation request has been sent.") };
};
