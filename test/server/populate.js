'use strict';

var configMap
  , getRandomName
  , names = ["Adam", "Stephen", "Alice"]
  , result, called = 0;

getRandomName = function () {
	called++;
	if (called >= names.length) {
		called = 0;
	}
	return names[called];
};

module.exports = function (t, a) {
	configMap = {
		id: 'User#',
		value: [
			{
				firstName: { get: getRandomName },
				lastName: { value: 'Kowalski' }
			},
			{
				annualTurnover: { value: 500 }
			},
			{
				'secretary/title': { value: 'mr' },
				'secretary/businessAddress/street': { value: 'Czereśniowa' }
			},
			{ partners: { multiple: true, min: 2, value:
				{ id: 'Person#', value: [
					{
						firstName: { get: getRandomName },
						isTall: { value: true }
					} ] }
				} },
			{
				primitivesMultiple: { multiple: true, value: [
					"first", "second", "third"
				] }
			}
		]
	};
	result = t(configMap, { count: 3 });
	result.sort(function (a, b) { return a.value - b.value; });
	a(result.length, 51);
	a(result[42].value, "3Alice");
	a(result[45].value, "11");
	a(result[49].value, "3second");
	a(result[50].value, "3Alice");
};
