'use strict';

module.exports =  function (resolved, specialCase) {
	if (specialCase === 'file') return _if(resolved.value._path, thumb(resolved.value));

	if (specialCase === 'constrainedValue' &&
			// Skip DynamicCurrency
			!resolved.value.constructor.hasOwnProperty('currencyChoicePropertyName')) {
		return resolved.value._resolvedValue;
	}
	return resolved.observable;
};
