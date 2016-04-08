'use strict';

module.exports =  function (resolved, specialCase) {
	if (specialCase === 'file') return _if(resolved.value._path, thumb(resolved.value));
	return resolved.observable;
};
