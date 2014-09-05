'use strict';

var source = require('../__playground/stats/create-database');

module.exports = function (t, a) {
	var target = t(source), targetUser = target.User.prototype, desc, testObject;

	testObject = function (obj, deepTestCase) {
		var desc;
		a.h3("Not imported");
		a.not(obj.$get('regular').object, obj);
		if (!deepTestCase) a.not(obj.$get('regularValue').object.__id__, obj.__id__, "Value");
		a.not(obj.$get('regularComputed').object, obj, "Computed");

		a.h3("Imported");
		a.h4("Regular");
		desc = obj.$get('statsRegular');
		a(desc.object, obj, "Owner");
		a(desc._value_, undefined, "Value");
		a.deep(desc, { type: target.String }, "Data");

		a.h4("Regular Stats Value");
		desc = obj.$get('statsRegularStatsValue');
		a(desc.object, obj, "Owner");
		a(desc._value_, undefined, "Value");
		a.deep(desc, { type: target.String }, "Data");

		a.h4("Regular Value");
		desc = obj.$get('statsRegularValue');
		a(desc.object, obj, "Owner");
		a(desc.hasOwnProperty('_value_') && desc._value_, 'foo', "Value");
		a.deep(desc, { type: target.String }, "Data");

		a.h4("Regular Value StatsValue");
		desc = obj.$get('statsRegularValueStatsValue');
		a(desc.object, obj, "Owner");
		a(desc.hasOwnProperty('_value_') && desc._value_, 'bar', "Value");
		a.deep(desc, { type: target.StringLine }, "Data");

		a.h4("Regular Computed");
		desc = obj.$get('statsRegularComputed');
		a(desc.object, obj, "Owner");
		a(desc._value_, undefined, "Value");
		a.deep(desc, { type: target.String }, "Data");

		a.h4("Regular Computed Stats Value");
		desc = obj.$get('statsRegularComputedStatsValue');
		a(desc.object, obj, "Owner");
		a(desc.hasOwnProperty('_value_') && desc._value_, 'def', "Value");
		a.deep(desc, { type: target.String }, "Data");

	};

	a.h1("Direct properties");
	testObject(targetUser);

	a.h1("Nested properties");
	a.h2("Not Imported");
	a.not(targetUser.$get('nested').object, targetUser);
	a.not(targetUser.$get('nestedStatsBase').object, targetUser, "Marked");
	a.not(targetUser.$get('nestedRich').object, targetUser, "Rich");

	a.h2("Imported");
	a(targetUser.statsNestedEmpty instanceof target.Object, true, "Nested empty");
	testObject(targetUser.statsNested);
	testObject(targetUser.statsNestedStatsBase);

	a.h1("Nested deep properties");
	a.h2("Not Imported");
	a.not(targetUser.statsNestedDeep.$get('nested').object, targetUser.statsNestedDeep, "Nested");
	a.not(targetUser.statsNestedDeep.$get('regular').object, targetUser.statsNestedDeep, "Regular");
	a.not(targetUser.statsNestedDeep.$get('regularValue').object, targetUser.statsNestedDeep,
		"Regular value");

	a.h2("Imported");
	testObject(targetUser.statsNestedDeep.statsNested);

	a.h1("Nested bridge");
	a.h2("Not Imported");
	a(targetUser.nestedBridge, undefined, "Type with stats base");
	a.not(targetUser.nestedBridgeStats.$get('statsRegular').object, targetUser.nestedBridgeStats,
		"Non stats parent");

	a.h2("Imported");
	desc = targetUser.nestedBridgeStats.$get('regularValue');
	a(desc.object, targetUser.nestedBridgeStats, "Owner");
	a(!desc.hasOwnProperty('_value_') || desc._value_ === undefined, true, "Value");
	a.deep(desc, { type: target.UsDollar }, "Data");

	a.h1("Types");
	a.h2("Not Imported");
	a(target.Date, undefined, "Date");
	a(target.TypeA, undefined, "TypeA");
	a(target.TypeB, undefined, "TypeB");

	a.h2("Imported");
	a(target.StringLine.__id__, 'StringLine', "StringLine");
	a(target.Currency.__id__, 'Currency', "Interim type");
	a(target.UsDollar.__id__, 'UsDollar', "Parent type");
	a(target.TypeD.__id__, 'TypeD', "TypeD");

	a.h2("Constructor properties");
	desc = target.TypeC.$get('regularValue');
	a(desc.object.__id__, target.TypeC.__id__, "Owner");
	a(desc._value_, 'foo', "Value");
	a.deep(desc, { type: target.String }, "Data");

	desc = target.TypeC.$get('statsRegular');
	a(desc.object, target.TypeC, "Owner");
	a(desc._value_, undefined, "Value");
	a.deep(desc, { type: target.String }, "Data");

	a.h2("Prototype properties");
	testObject(target.TypeC.prototype, true);
	a.h3("Demanded by extension");
	desc = target.TypeC.prototype.$get('regularValue');
	a(desc.object, target.TypeC.prototype, "Owner");
	a(desc._value_, 'foo', "Value");
	a.deep(desc, { type: target.String }, "Data");

};
