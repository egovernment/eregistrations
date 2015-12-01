'use strict';

var toNatural  = require('es5-ext/number/to-pos-integer')
  , location   = require('mano/lib/client/location')
  , _          = require('mano').i18n.bind('Print')
  , arrayToSet = require('../utils/array-to-set')

  , keys = Object.keys, ceil = Math.ceil;

exports._parent = require('./print-base');

exports.main = {
	content: function () {
		var statusMap = exports._statusMap(this)
		  , perPage = exports._cacheLimits(this).usersPerPage;

		var getPageCount = function (value) {
			if (!value) return 1;
			return ceil(value / perPage);
		};
		var getSection  = function (businessProcesses, data) {
			return [div({ class: 'print-users-list-caption' },
				data.label, span(" (", businessProcesses._length, ")")),
				table({ class: 'print-users-list' },
					exports._businessProcessesTable(businessProcesses))];
		};

		return section({ id: 'main' },
			mmap(location.query.get('status'), function (value) {
				var status, businessProcesses, pageCount;
				if (value == null) {
					if (statusMap.all) {
						value = 'all';
					}
					value = '';
				} else if (value && statusMap[value]) {
					status = value;
				} else {
					return;
				}
				businessProcesses = statusMap[status].data;
				pageCount = businessProcesses._size.map(getPageCount);
				return mmap(location.query.get('page'), function (value) {
					var page, result = []
					  , businessProcessesSnapshot = businessProcesses.toArray(exports._defaultSort);
					if ((value == null) || (value === '1')) {
						page = 1;
					} else {
						page = toNatural(value);
						if (!page) return;
						if (String(page) !== value) return;
					}
					result.push(_if(gt(pageCount, 1), p({ class: 'page' }, _("Page"), page, " /",
						pageCount)));
					businessProcessesSnapshot =
						businessProcessesSnapshot.slice((page - 1) * perPage, (page - 1) * perPage + perPage);
					if (status !== 'all') {
						result.push(getSection(businessProcessesSnapshot, statusMap[status]));
					} else {
						businessProcessesSnapshot = arrayToSet(businessProcessesSnapshot);
						result.push(ul(keys(statusMap).filter(function (name) {
							return name !== 'all';
						}).sort(function (a, b) {
							return statusMap[a].order - statusMap[b].order;
						}), function (state) {
							return getSection(businessProcessesSnapshot.and(statusMap[state].data)
								.toArray(exports._defaultSort), statusMap[state]);
						}));
					}
					return _if(gt(page, pageCount), null, result);
				});
			}));
	}
};

exports['print-page-title'] = function () { insert(this.processingStep.label); };

exports._businessProcessesTable = Function.prototype;
exports._statusMap = Function.prototype;
exports._defaultSort = Function.prototype;
exports._cacheLimits = Function.prototype;
