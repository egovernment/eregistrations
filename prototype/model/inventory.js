'use strict';

var db         = require('mano').db
  , UsDollars  = require('dbjs-ext/number/currency/us-dollar')(db)
  , BusinessProcessNew = require('../../model/business-process-new')(db,
		{ className: 'BusinessProcessNew' })

  , _  = require('mano').i18n.bind('Model');

module.exports = require('../../model/lib/define-inventory')(BusinessProcessNew, {
	currencyType: UsDollars,
	assets: {
		label: _("Property"),
		inputPlaceholder: _("Property #1"),
		description: _("All the buildings, land and other immovable property belonging to the " +
			"merchant and are affected to their activity.")
	},
	machinery: {
		label: _("Machinery, equipment and vehicles"),
		inputPlaceholder: _("Machinery, equipment and vehicles #1"),
		description: _("All the machines, tools, computer equipment, vehicles and other movable " +
			"property affected to the commercial activity."),
		addLabel: _("Add")
	},
	goods: {
		label: _("Goods"),
		inputPlaceholder: _("Goods #1"),
		description: _("Value of the goods or animals which has in stock and for sale."),
		addLabel: _("Add")
	},
	banks: {
		label: _("Banks"),
		inputPlaceholder: _("Bank #1"),
		description: _("Balance(s) bank account(s)."),
		addLabel: _("Add")
	},
	receivables: {
		label: _("Accounts receivable"),
		inputPlaceholder: _("Account receivable #1"),
		description: _("The ' or receivable recorded increases and decreases resulting from the" +
			" sale of concepts other than goods or provision of services, exclusively to documented " +
			"credit (credit titles, bills of Exchange and promissory notes) in favor of the company " +
			"and for this there is programs to carry out operations."),
		addLabel: _("Add")
	},
	cash: {
		label: _("Cash"),
		inputPlaceholder: _("Cash #1"),
		description: _("Total amount in cash")
	}
});
