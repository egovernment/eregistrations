'use strict';

var isObject = require('es5-ext/object/is-object')
  , isString = require('es5-ext/string/is-string')
  , configMap
  , output
  , getRandomName
  , getRandomPrimitive
  , names = ["Adam", "Stephen", "Alice"]
  , primitives = ["a", "b", "c"]
  , result, called = 0, calledPrimitive = 0, dbKey;

getRandomName = function () {
	called++;
	if (called >= names.length) {
		called = 0;
	}
	return names[called];
};

getRandomPrimitive = function () {
	calledPrimitive++;
	if (calledPrimitive >= primitives.length) {
		calledPrimitive = 0;
	}
	return primitives[calledPrimitive];
};

module.exports = function (t, a) {
	configMap = {
		id: 'User#',
		value: [
			[
				{ sKey: 'firstName', get: getRandomName },
				{ sKey: 'lastName', value: 'Kowalski' }
			],
			[
				{ sKey: 'annualTurnover', value: { value: 500 } }
			],
			[
				{ sKey: 'secretary/title', value: { value: 'mr' } },
				{ sKey: 'secretary/businessAddress/street', value: { value: 'Czereśniowa' } }
			],
			[
				{ sKey: 'petitioner',  value: { value: {
					id: 'Partner#',
					value: [
						[
							{ sKey: 'firstName', get: getRandomName },
							{ sKey: 'lastName', value: 'Smith' }
						]
					]
				} } }
			],
			[
				{ sKey: 'partners', multiple: true, min: 2, value: { id: 'Person#', value: [
					[
						{ sKey: 'firstName', get: getRandomName },
						{ sKey: 'isTall', value: true }
					]
				] }
					}
			],
			[
				{ sKey: 'primitivesMultiple', multiple: true, value: [
					"first", "second", "third"
				] }
			],
			[
				{ sKey: 'primitivesMultipleWithGet', multiple: true, min: 2, get: getRandomPrimitive }
			]
		]
	};
	output = [
		{ id: null, value: '7User#', stamp: null },
		{ id: [0, '/firstName'],                   value: '3Stephen', stamp: 0 },
		{ id: [0, '/lastName'],                    value: '3Kowalski', stamp: 1 },
		{ id: [0, '/annualTurnover'],              value: '2500', stamp: 2 },
		{ id: [0, '/secretary/title'],             value: '3mr', stamp: 3 },
		{ id: [0, '/secretary/businessAddress/street'],
			value: '3Czereśniowa', stamp: 4 },
		{ id: null,                                value: '7Partner#', stamp: null },
		{ id: [6, '/firstName'],                   value: '3Alice', stamp: 6 },
		{ id: [6, '/lastName'],                    value: '3Smith', stamp: 7 },
		{ id: [6, '/petitioner'],                  value: [6], stamp: 8 },
		{ id: null,                                value: '7Person#', stamp: null },
		{ id: [10, '/firstName'],                  value: '3Adam', stamp: 10 },
		{ id: [10, '/isTall'],                     value: '11', stamp: 11 },
		{ id: [0, '/partners*', 9],                value: '11', stamp: 12 },
		{ id: null,                                value: '7Person#', stamp: null },
		{ id: [14, '/firstName'],                  value: '3Adam', stamp: 13 },
		{ id: [14, '/isTall'],                     value: '11', stamp: 14 },
		{ id: [0, '/partners*', 13],               value: '11', stamp: 15 },
		{ id: [0, '/primitivesMultiple*first'],    value: '3first', stamp: 16 },
		{ id: [0, '/primitivesMultiple*second'],   value: '3second', stamp: 17 },
		{ id: [0, '/primitivesMultiple*third'],    value: '3third', stamp: 18 },
		{ id: [0, '/primitivesMultipleWithGet*b'], value: '3b', stamp: 19 },
		{ id: [0, '/primitivesMultipleWithGet*c'], value: '3c', stamp: 20 },
		{ id: [0, '/primitivesMultipleWithGet*a'], value: '3a', stamp: 21 }
	];
	result = t(configMap, { count: 1, stamp: 1 });
	result.forEach(function (entry, index) {
		a(isObject(output[index]), true);
		if (!output[index]) {
			return;
		}
		if (Array.isArray(output[index].id)) {
			dbKey = output[index].id.reduce(function (prev, curr) {
				if (!isString(prev)) {
					prev = result[prev].id;
				}
				if (!isString(curr)) {
					curr = result[curr].id;
				}
				return prev + curr;
			});
			a(entry.id, dbKey);
		}
		if (Array.isArray(output[index].value)) {
			a(entry.value === result[output[index].value[0]].id);
		} else {
			a(entry.value === output[index].value);
		}
		if (output[index].stamp != null) {
			a.ok(entry.stamp > result[output[index].stamp].stamp);
		}
	});
};
