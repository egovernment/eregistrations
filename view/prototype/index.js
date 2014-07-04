'use strict';

exports.main = function () {
	div({ 'class': 'l-container l-secondary l-banner' },
		div({ 'class': 'l-container l-primary m-banner' },
				p("Main page"),
				p("MAina main")
				)
		);
	div({ 'class': 'l-container l-primary' },
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-one.png' }),
			h3('one'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. ")
			),
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-two.png' }),
			h3('two'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. ")
			),
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-tree.png' }),
			h3('tree'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "))
		);

};
