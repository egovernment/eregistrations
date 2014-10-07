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
			{ partners: { multiple: true, value: [
				{ id: 'Person#', value: [
					{
						firstName: { get: getRandomName },
						isTall: { value: true }
					}
				] },
				{ id: 'Person#', value: [
					{
						firstName: { get: getRandomName },
						isTall: { value: false }
					}
				] }
			] } }
		]
	};
	result = t(configMap, { count: 3 });
	result.sort(function (a, b) { return a.value - b.value; });
	a(result.length, 42);
	a(result[2].value, "3Kowalski");
	a(result[12].value, "3Adam");
	a(result[29].value, "3Stephen");
};
