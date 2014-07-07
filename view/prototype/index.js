'use strict';

exports.main = function () {
	div({ 'class': 'public-banner' },
		div({ 'class': 'banner-infos' },
				div({ 'class': 'baner-box-text s-resize-center' },
					h1({ 'class': 's-primary' },
						'Turn your online business on'),
					h5({ 'class': 's-primary' },
						'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut in ' +
						'massa malesuada, pharetra urna nec, pellentesque tortor. '),
					button({ 'class': 'btn btn-primary btn-lg' },
						'Cree su cuenta')
				),
				div({ 'class': 'baner-box-img' },
					img({ 'src': '/img/mac.png' })
				)
				)
		);
	div({ 'class': 'public-text' },
		div({ 'class': 'm-box-text-centered' },
			img({ 'src': 'img/img_300.png' }),
			h3('Create your file'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 'btn btn-primary btn-xs' },
				'Mas info'
				)
			),
		div({ 'class': 'm-box-text-centered' },
			img({ 'src': 'img/img_300.png' }),
			h3('Pay costs'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 'btn btn-primary btn-xs' },
				'Mas info'
				)
			),
		div({ 'class': 'm-box-text-centered' },
			img({ 'src': 'img/img_300.png' }),
			h3('Remove certificates'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 'btn btn-primary btn-xs' },
				'Mas info'
				))
		);

};
