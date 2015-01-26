'use strict';

exports['req-tab'] = { class: { active: false } };
exports['cost-tab'] = { class: { active: true } };
exports['cond-tab'] = { class: { active: false } };

exports['summary-tabs'] = {
	class: { 'user-guide-lomas-tab-costs': true,
		'user-guide-lomas-tab-requirements': false },
	'':  function () {
		p("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
			"Duis dolor velit, feugiat ut nulla ac, mollis ornare orci. " +
			"Praesent porttitor dui a ante luctus gravida.");
		ul(
			li(span("56$"),
				span("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
			li(span("43$"),
				span("Lorem ipsum dolor sit amet, consectetur elit. ")),
			li(span("123$"),
				span("Lorem ipsum dolor. ")),
			li(span("56$"),
				span("Lorem ipsum dolor sit amet, consectetur adipiscing elit. ")),
			li(span("56$"),
				span("Lorem ipsum dolor sit amet, consectetur. ")),
			li(span("87$"),
				span("Lorem ipsum dolor sit amet. ")),
			li(span("135$"),
				span("Lorem ipsum dolor elit. ")),
			li(span("45$"),
				span("Lorem ipsum dolor sit amet.")),
			li(span("345$"),
				span("Total"))
		);
	}
};
