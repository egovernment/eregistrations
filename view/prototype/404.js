'use strict';

exports.main = function () {
	div({ 'class': 'public-error' },
		div(
			h1("Oops!"),
			img({ 'src': '/img/404.png' }),
			h2("We are very sorry, but it seems that page that You are" +
				" looking for dose not exist.")
		)
		);
};
