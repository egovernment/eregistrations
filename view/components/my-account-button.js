'use strict';

module.exports = function (user, roleTitle) {
	return form({ method: 'post', action: '/change-business-process/' },
		input({ type: 'hidden',
			name: user.__id__ + '/currentBusinessProcess', value: null }),
		button({ type: 'submit' }, roleTitle));
};
