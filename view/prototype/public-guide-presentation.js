'use strict';

exports.tab1 = { class: { active: true } };
exports['side-content'] = function () {
	div({ class: 'public-article' },
		p({ class: 'public-article-block' },
			'Integer pharetra nisl a iaculis suscipit.' +
			' Integer a feugiat velit.'),
		p('Fusce eu neque eu ante pharetra gravida' +
			' vehicula sit amet nulla. In id tortor vitae' +
			' felis sodales varius vel eu mi.'),
		p('Pellentesque tempor nulla sed tincidunt molestie.' +
			' Cras aliquet augue a nunc lacinia hendrerit. Vivamus' +
			' massa odio, feugiat ac metus sit amet, dictum lacinia' +
			' nisi. Sed eleifend arcu porttitor, condimentum quam ut,' +
			' vestibulum diam. Vivamus vitae posuere odio.')
		);
};
