'use strict';

exports.main = function () {
	div({ 'class': 'l-container l-cont-secondary l-banner' },
		div({ 'class': 'l-container l-cont-primary m-banner' },
				div({ 'class': 'l-baner-box-primary s-resize-center' },
					h1({ 'class': 's-primary' },
						'Habilite su negocio en línea'),
					h5({ 'class': 's-primary' },
						'Toda persona o empresa ejerciendo una actividad lucrativa en Lomas' +
						' de Zamora debe solicitar la habilitación de su negocio'),
					h5({ 'class': 's-secondary' },
						'Sepa aquí en que consiste la habilitación de negocio'),
					button({ 'class': 's-btn-primary s-btn-large' },
						'Cree su cuenta')
				),
				div({ 'class': 'l-baner-box-secondary' },
					img({ 'src': '/img/mac.png' })
				)
				)
		);
	div({ 'class': 'l-container l-cont-primary s-spacing-primary' },
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-one.png' }),
			h3('Cree su expediente'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 's-btn-small s-btn-primary' },
				'Mas info'
				)
			),
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-two.png' }),
			h3('Pague los costos'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 's-btn-small s-btn-primary' },
				'Mas info'
				)
			),
		div({ 'class': 'm-box-secondary' },
			img({ 'src': 'img/icon-tree.png' }),
			h3('Retire sus certificados'),
			p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras ut" +
				" nequepharetra, pellentesque risus in, condimentum nulla. "),
			button({ 'class': 's-btn-small s-btn-primary' },
				'Mas info'
				))
		);

};
