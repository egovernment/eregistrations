'use strict';

exports.tab1 = { class: { active: true } };
exports['side-content'] = function () {
	div({ class: 'public-content' },
		'Content of tab 1');
};
