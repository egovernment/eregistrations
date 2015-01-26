'use strict';

exports['req-tab'] = { class: { active: false } };
exports['cost-tab'] = { class: { active: false } };
exports['cond-tab'] = { class: { active: true } };

exports['summary-tabs'] = {
	class: { 'user-guide-lomas-tab-conditions': true,
		'user-guide-lomas-tab-costs': false,
		'user-guide-lomas-tab-requirements': false },
	'':  function () {
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
			"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
			"Praesent porttitor dui a ante luctus gravida.");
		ul(
			li(
				h3("Electricity"),
				table(
					tbody(
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
									"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
									"Praesent porttitor dui a ante luctus gravida."),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 27")),
									li("Ordinance 11025 - ", a("art. 28"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						)
					)
				)
			),
			li(
				h3("Personal"),
				table(
					tbody(
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
									"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
									"Praesent porttitor dui a ante luctus gravida."),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 27")),
									li("Ordinance 11025 - ", a("art. 28"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						)
					)
				)
			),
			li(
				h3("Local"),
				table(
					tbody(
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
									"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
									"Praesent porttitor dui a ante luctus gravida."),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 27")),
									li("Ordinance 11025 - ", a("art. 28"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26")),
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						),
						tr(
							td(span({ class: 'fa fa-check' }, "Check")),
							td("Lorem ipsum dolor sit amet, consectetur adipiscing elit. "),
							td(
								ul(
									li("Ordinance 11025 - ", a("art. 26"))
								)
							)
						)
					)
				)
			)
		);
	}
};
