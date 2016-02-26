// Sends account creation notification (as an input it takes data as submitted with form)

'use strict';

var ensureCallable = require('es5-ext/object/valid-callable')
  , compileTpl     = require('es6-template-strings/compile')
  , resolveTpl     = require('es6-template-strings/resolve-to-string')
  , mailer         = require('mano/lib/server/mailer')
  , toPlainNames   = require('mano/lib/utils/dbjs-to-plain-names')
  , urlParse       = require('url').parse
  , mano           = require('mano')

  , _ = mano.i18n, db = mano.db
  , domain = mano.env.url && urlParse(mano.env.url).host
  , fullNameGetter = ensureCallable(db.Person.prototype.getDescriptor('fullName')._value_)
  , subject = compileTpl(_("M01 - Create Account email subject - Domain: ${domain}"));

var body = compileTpl(_("Mx1 - General - Email message greeting - Full name: ${fullName}") +
	"\n\n" + _("M01 - Create Account\n\nEmail: ${email}\n\nUrl: ${domain}/ayuda/.") + "\n\n" +
	_("Mx2 - General - Email message\n\nsignature"));

module.exports = function (data) {
	var inserts;
	data = toPlainNames(data);
	inserts = {
		domain: domain,
		fullName: fullNameGetter.call(data),
		email: data.email
	};
	return mailer({
		from: mano.mail.config.from,
		to: data.email,
		subject: resolveTpl(subject, inserts),
		text: resolveTpl(body, inserts)
	});
};
