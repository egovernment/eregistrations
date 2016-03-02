'use strict';

var last     = require('es5-ext/string/#/last')
  , template = require('es6-template-strings')
  , mailer   = require('mano/lib/server/mailer')
  , mano     = require('mano')

  , _ = mano.i18n.bind("Authentication")
  , origin = mano.env.url
  , getUrl;

if (origin == null) throw new Error("Url not set in env.json");
if (last.call(origin) === '/') origin = String(origin).slice(0, -1);

getUrl = function (url, token, email) {
	return origin + url + '?token=' + token;
};

module.exports = function (data) {
	return mailer({
		to: data.email,
		subject: _("Invitation to create an account"),
		text: template(_("To create an account, please setup a password at ${url}"),
			{ url: getUrl('/create-managed-account/', data.token) })
	});
};
