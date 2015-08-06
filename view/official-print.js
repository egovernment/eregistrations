'use strict';

var location = require('mano/lib/client/location')
  , db       = require('mano').db
  , _ = require('mano').i18n.bind('Official')
  , keys = Object.keys
  , officialStatusMap;

exports._parent = require('./print-base');

exports.main = {
	content: function () {

		var getSection  = function (state, url) {
			var data = officialStatusMap[state],
				businessProcesses = data.data.toArray(exports._defaultSort);

			return table({ class: 'print-users-list' },
				thead(tr(th({ colspan: 2 }, data.label, span(" (", businessProcesses._length, ")"))),
					tr(th(_("User")), th(_("Creation date")))),
				tbody(_if(gt(businessProcesses._length, 0),
					list(businessProcesses, function (user) {
						tr(td(user._businessName, " - ",
							span(user.representative._email)),
							td(mmap(user.isSubmitted._lastModified,
								function (lm) {
									if (!lm) return;
									return String(new db.DateTime(lm / 1000));
								})));
					}), tr({ class: 'empty' }, td({ colspan: 3 }, _("There are no users at the moment."))))));
		};

		officialStatusMap = exports._statusMap(this);

		section({ id: 'main' },
			mmap(location.query.get('estado'), function (value) {

				if (value == null) return getSection('', url);
				if (officialStatusMap[value] == null) return;
				if (value !== 'todos') return getSection(value, url);

				return list(keys(officialStatusMap).filter(function (name) {
					return name !== 'todos';
				}).data.sort(exports._defaultSort), function (state) { return getSection(state, url); });
			}));

	}
};

exports['print-page-title'] = function () {
	exports._officialRoleName();
};

exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
exports._officialRoleName = Function.prototype;
