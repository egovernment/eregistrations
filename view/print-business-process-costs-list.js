'use strict';

var _  = require('mano').i18n.bind('User')
  , db = require('mano').db
  , location = require('mano/lib/client/location');

exports._parent = require('./print-base');
exports._match = 'businessProcess';

exports['print-page-title'] = function () {
	h2(_("Registration costs"));
};

exports.main = function () {
	var amountDescriptor = db.Cost.prototype.getDescriptor('amount');
	var totalCostAmount = location.query.get('total');

	h2(this.businessProcess._businessName);
	ul(
		{ class: 'print-costs-list' },
		list(this.businessProcess.costs.map, function (cost) {
			var costAmount = location.query.get(cost.key);

			return _if(costAmount, li(span(cost._label), " ",
				span(costAmount.map(function (costAmountValue) {
					if (!costAmountValue) return;

					return (new amountDescriptor.type(costAmountValue)).toString(amountDescriptor);
				}))));

		}),
		_if(totalCostAmount, li({ class: 'print-costs-list-total' }, span(_("Total Costs:")),
			" ", span(totalCostAmount.map(function (totalCostAmountValue) {
				if (!totalCostAmountValue) return;

				return (new amountDescriptor.type(totalCostAmountValue)).toString(amountDescriptor);
			}))))
	);
};
