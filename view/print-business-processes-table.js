'use strict';

var location = require('mano/lib/client/location')
, keys = Object.keys
, officialStatusMap;

exports._parent = require('./print-base');

exports.main = {
	content: function () {
		var getSection  = function (state, url) {
			var data = officialStatusMap[state],
				businessProcesses = data.data.toArray(exports._defaultSort);

			return [div({ class: 'print-users-list-caption' },
					data.label, span(" (", businessProcesses._length, ")")),
				table({ class: 'print-users-list' },
					exports._businessProcessesTable(businessProcesses))];
		};

		officialStatusMap = exports._statusMap(this);

		return section({ id: 'main' },
			mmap(location.query.get('state'), function (value) {

				if (value == null) return getSection('', url);
				if (officialStatusMap[value] == null) return;
				if (value !== 'all') return getSection(value, url);

				return list(keys(officialStatusMap).filter(function (name) {
					return name !== 'all';
				}).data.sort(exports._defaultSort), function (state) { return getSection(state, url); });
			}));
	}
};

exports['print-page-title'] = function () {
	h2(this.processingStep.label);
};

exports._businessProcessesTable = Function.prototype;
exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
