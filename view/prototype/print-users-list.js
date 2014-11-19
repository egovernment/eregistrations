'use strict';

exports.body = {
	class: { print: true },
	'': function () {
		header(
			{ class: 'print-header' },
			img({ src: '/img/logo-2.png' }),
			div(
				h2("Revision"),
				p("19/11/2015")
			)
		);
		section(
			{ class: 'print-header' },
			table(
				thead(
					tr(
						th("Pending for revision", " ", span("(3)"))
					),
					tr(
						th("User"),
						th("Number"),
						th("Creation date")
					)
				),
				tbody(
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					)
				)
			),

			table(
				thead(
					tr(
						th("Sent for corrections", " ", span("(3)"))
					),
					tr(
						th("User"),
						th("Number"),
						th("Creation date")
					)
				),
				tbody(
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					)
				)
			),

			table(
				thead(
					tr(
						th("Rejected", " ", span("(3)"))
					),
					tr(
						th("User"),
						th("Number"),
						th("Creation date")
					)
				),
				tbody(
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					)
				)
			),

			table(
				thead(
					tr(
						th("Approved", " ", span("(3)"))
					),
					tr(
						th("User"),
						th("Number"),
						th("Creation date")
					)
				),
				tbody(
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					),
					tr(
						td("John Watson", span('johnwatson@gmail.com')),
						td("123-234-342"),
						td("23/07/2014 18:09:22")
					)
				)
			)
		);
	}
};
