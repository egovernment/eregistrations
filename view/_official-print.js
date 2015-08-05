'use strict';

var format   = require('es5-ext/date/#/format')
  , location = require('mano/lib/client/location')
  , db       = require('mano').db
  , _ = require('mano').i18n.bind('Official')
  , keys = Object.keys
  , officialStatusMap;

module.exports = function (baseUrl, statusMap, defaultSort, officialRoleName, cssPrefix) {

	var getSection  = function (state, url) {
		var data = officialStatusMap[state], users = data.data.toArray(defaultSort);

		return table({ class: 'print-users-list' },
			thead(tr(th({ colspan: 3 }, data.label, span(" (", users._length, ")"))),
				tr(th(_("User")), th(_("Creation date")))),
			tbody(_if(gt(users._length, 0),
				list(users, function (user) {
					tr(td(user._businessName, " - ",
						span(_if(user._email, user._email, user.homeAddress._personalEmail))),
						td(mmap(user._submitted._lastModified,
							function (lm) {
								if (!lm) return;
								return String(new db.DateTime(lm / 1000));
							})));
				}), tr({ class: 'empty' }, td({ colspan: 3 }, _("There are no users at the moment."))))));
	};

	return {
		class: { print: true },
		'': function () {
			var today = new Date(), url = baseUrl.bind(this.root);

			officialStatusMap = this.statusMap || statusMap;

			link({ href: stUrl('/' + cssPrefix + '-print.css'), rel: 'stylesheet' });

			header({ id: 'main', class: 'print-header' },
				img({ src: stUrl('/img/logo-sm.png') }),
				div({ class: 'print-page-title' }, h2(officialRoleName),
					p(format.call(today, '%d/%m/%Y'))));
			hr();

			section({ id: 'main' },
				mmap(location.query.get('estado'), function (value) {

					if (value == null) return getSection('', url);
					if (officialStatusMap[value] == null) return;
					if (value !== 'todos') return getSection(value, url);

					return list(keys(officialStatusMap).filter(function (name) {
						return name !== 'todos';
					}).sort(function (a, b) {
						return officialStatusMap[a].order - officialStatusMap[b].order;
					}), function (state) { return getSection(state, url); });
				}));
		}
	};
};
