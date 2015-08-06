'use strict';

var location = require('mano/lib/client/location')
  , db       = require('mano').db
  , _ = require('mano').i18n.bind('Official')
  , keys = Object.keys
  , officialStatusMap;

module.exports = function (url, statusMap, defaultSort, officialRoleName, cssPrefix) {
	var getSection  = function (state, url) {
		var data = officialStatusMap[state], users = data.data.toArray(defaultSort);

		return table({ class: 'print-users-list' },
			thead(tr(th({ colspan: 2 }, data.label, span(" (", users._length, ")"))),
				tr(th(_("User")), th(_("Creation date")))),
			tbody(_if(gt(users._length, 0),
				list(users, function (user) {
					tr(td(user._businessName, " - ",
						span(user.representative._email)),
						td(mmap(user.isSubmitted._lastModified,
							function (lm) {
								if (!lm) return;
								return String(new db.DateTime(lm / 1000));
							})));
				}), tr({ class: 'empty' }, td({ colspan: 3 }, _("There are no users at the moment."))))));
	};

	officialStatusMap = statusMap();

	section({ id: 'main' },
		mmap(location.query.get('estado'), function (value) {

			if (value == null) return getSection('', url);
			if (officialStatusMap[value] == null) return;
			if (value !== 'todos') return getSection(value, url);

			return list(keys(officialStatusMap).filter(function (name) {
				return name !== 'todos';
			}).data.sort(defaultSort), function (state) { return getSection(state, url); });
		}));
};
