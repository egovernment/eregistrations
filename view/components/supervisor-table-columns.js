'use strict';

var _          = require('mano').i18n.bind('View: Component: Supervisor')
  , timeRanges = require('../../utils/supervisor-time-ranges')
  , someRight  = require('es5-ext/array/#/some-right');

exports.columns = [{
	head: _("Role"),
	data: function (processingStep) {
		var assignee = processingStep._assignee;

		return [
			processingStep._label,
			_if(assignee, [' ', span('(', assignee, ')')])
		];
	}
}, {
	head: _("Name"),
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return businessProcess._businessName;
	}
}, {
	head: _("Time"),
	data: function (processingStep) {
		var result, value;
		return processingStep._status._lastModified.map(function (modDate) {
			value = Date.now() - (modDate / 1000);
			if (!timeRanges[1] || value < timeRanges[1].value) {
				result = _("Recent");
			} else {
				someRight.call(timeRanges, function (item) {
					if (value >= item.value) {
						result = item.label;
						return true;
					}
				});
			}

			return result;
		});
	}
}, {
	head: _("Registration"),
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return span(businessProcess._label);
	}
}, {
	class: 'submitted-user-data-table-link',
	data: function (processingStep) {
		var businessProcess = processingStep.master;
		return a({ class: 'actions-edit',
				href: url(businessProcess.__id__) },
			span({ class: 'fa fa-search' }, _("Go to")));
	}
}];