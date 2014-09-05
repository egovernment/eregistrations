'use strict';

var Database     = require('dbjs')
  , db           = new Database()
  , DateType     = require('dbjs-ext/date-time/date')(db)
  , StringLine   = require('dbjs-ext/string/string-line')(db)
  , UsDollar     = require('dbjs-ext/number/currency/us-dollar')(db)

  , defineTestProperties, TypeA, TypeB, TypeC, TypeD, user;

user = db.Object.extend('User').prototype;

defineTestProperties = function (obj) {
	return obj.defineProperties({
		regular: {
			type: DateType
		},
		regularValue: {
			type: db.String,
			value: 'foo'
		},
		regularComputed: {
			type: db.String,
			value: function () {}
		},
		statsRegular: {
			type: db.String,
			statsBase: null
		},
		statsRegularStatsValue: {
			type: db.String,
			statsBase: 'elo'
		},
		statsRegularValue: {
			type: db.String,
			value: 'foo',
			statsBase: null
		},
		statsRegularValueStatsValue: {
			type: StringLine,
			value: 'bar',
			statsBase: 'foo'
		},
		statsRegularComputed: {
			type: db.String,
			value: function () {},
			statsBase: null
		},
		statsRegularComputedStatsValue: {
			type: db.String,
			value: function () {},
			statsBase: 'def'
		}
	});
};

TypeA = db.Object.extend('TypeA');
defineTestProperties(TypeA);
defineTestProperties(TypeA.prototype);
TypeB = TypeA.extend('TypeB');

TypeC = db.Object.extend('TypeC');
TypeC.defineProperties({
	regularValue: {
		type: db.String,
		value: 'foo'
	},
	statsRegular: {
		type: db.String,
		statsBase: null
	}
});
defineTestProperties(TypeC.prototype);
TypeD = TypeC.extend('TypeD');

defineTestProperties(user);
user.defineProperties({
	nested: {
		type: db.Object,
		nested: true
	},
	nestedStatsBase: {
		type: db.Object,
		nested: true,
		statsBase: null
	},
	nestedRich: {
		type: db.Object,
		nested: true
	},
	statsNested: {
		type: db.Object,
		nested: true
	},
	statsNestedEmpty: {
		type: db.Object,
		nested: true
	},
	statsNestedStatsBase: {
		type: db.Object,
		nested: true,
		statsBase: null
	},
	statsNestedDeep: {
		type: db.Object,
		nested: true
	},
	nestedBridge: {
		type: TypeB,
		nested: true
	},
	nestedBridgeStats: {
		type: TypeD,
		nested: true
	}
});

defineTestProperties(user.statsNested);
defineTestProperties(user.statsNestedStatsBase);
user.statsNestedEmpty.define('emptyStats', { statsBase: null });
user.nestedRich.defineProperties({
	regular: {
		type: db.String
	},
	regularValue: {
		type: db.String,
		value: 'foo'
	},
	regularComputed: {
		type: db.String,
		value: function () {}
	}
});
user.statsNestedDeep.defineProperties({
	statsNested: {
		type: db.Object,
		nested: true
	},
	nested: {
		type: db.Object,
		nested: true
	},
	regular: {
		type: db.String
	},
	regularValue: {
		type: db.String,
		value: 'foo'
	}
});
defineTestProperties(user.statsNestedDeep.statsNested);

user.nestedBridge.$statsRegular.required = true;

user.nestedBridgeStats.$statsRegular.required = true;
user.nestedBridgeStats.$regularValue.statsBase = null;
user.nestedBridgeStats.$regularValue.type = UsDollar;

module.exports = db;
