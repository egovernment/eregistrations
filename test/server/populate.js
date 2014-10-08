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
				{ name: 'firstName', value: { get: getRandomName } },
				{ name: 'lastName', value: { value: 'Kowalski' } }
			],
			[
				{ name: 'annualTurnover', value: { value: 500 } }
			],
			[
				{ name: 'secretary/title', value: { value: 'mr' } },
				{ name: 'secretary/businessAddress/street', value: { value: 'Czereśniowa' } }
			],
			[
				{ name: 'petitioner',  value: { value: {
					id: 'Partner#',
					value: [
						[
							{ name: 'firstName', value: { get: getRandomName } },
							{ name: 'lastName', value: { value: 'Smith' } }
						]
					]
				} } }
			],
			[
				{ name: 'partners', value: { multiple: true, min: 2, value: { id: 'Person#', value: [
					[
						{ name: 'firstName', value: { get: getRandomName } },
						{ name: 'isTall', value: { value: true } }
					]
				] }
					} }
			],
			[
				{ name: 'primitivesMultiple', value: { multiple: true, value: [
					"first", "second", "third"
				] } }
			],
			[
				{ name: 'primitivesMultipleWithGet',
					value: { multiple: true, min: 2, get: getRandomPrimitive }
					}
			]
		]
	};
	output = [
		{ id: null, value: '7User#', stamp: null },
		{ id: [0, '/firstName'],                   value: '3Stephen' },
		{ id: [0, '/lastName'],                    value: '3Kowalski' },
		{ id: [0, '/annualTurnover'],              value: '2500' },
		{ id: [0, '/secretary/title'],             value: '3mr' },
		{ id: [0, '/secretary/businessAddress/street'],
			value: '3Czereśniowa' },
		{ id: null,                                value: '7Partner#' },
		{ id: [6, '/firstName'],                   value: '3Alice' },
		{ id: [6, '/lastName'],                    value: '3Smith' },
		{ id: [6, '/petitioner'],                  value: [6] },
		{ id: null,                                value: '7Person#' },
		{ id: [10, '/firstName'],                  value: '3Adam' },
		{ id: [10, '/isTall'],                     value: '11' },
		{ id: [0, '/partners*', 9],                value: '11' },
		{ id: null,                                value: '7Person#' },
		{ id: [14, '/firstName'],                  value: '3Adam' },
		{ id: [14, '/isTall'],                     value: '11' },
		{ id: [0, '/partners*', 13],               value: '11' },
		{ id: [0, '/primitivesMultiple*first'],    value: '3first' },
		{ id: [0, '/primitivesMultiple*second'],   value: '3second' },
		{ id: [0, '/primitivesMultiple*third'],    value: '3third' },
		{ id: [0, '/primitivesMultipleWithGet*b'], value: '3b' },
		{ id: [0, '/primitivesMultipleWithGet*c'], value: '3c' },
		{ id: [0, '/primitivesMultipleWithGet*a'], value: '3a' }
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
		a.ok(entry.stamp >= (result[0] + index));
		if (Array.isArray(output[index].value)) {
			a(entry.value === result[output[index].value[0]].id);
		} else {
			a(entry.value === output[index].value);
		}
	});
};
