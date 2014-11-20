'use strict';

exports['print-page-title'] = function () {
	h2("Registration history");
	p("19/11/2015");
};

exports.main = function () {
	h2("John Smith");
	h3("History of submission No. 123-123-567");
	table(
		{ class: 'print-user-history' },
		tbody(
			tr(
				th(
					div("User")
				),
				td(
					div("24/07/2014 10:09:22")
				),
				td(
					div("Required modifications sent by user")
				)
			),
			tr(
				th(
					div("File sent")
				),
				td(
					div("24/07/2014 13:09:22")
				),
				td(
					div("File sent")
				)
			),
			tr(
				th(
					div("Official")
				),
				td(
					div("24/07/2014 16:19:22")
				),
				td(
					div("Document accepted")
				)
			),
			tr(
				th(
					div("User")
				),
				td(
					div("24/07/2014 10:09:22")
				),
				td(
					div("Required modifications sent by user")
				)
			),
			tr(
				th(
					div("File sent")
				),
				td(
					div("24/07/2014 13:09:22")
				),
				td(
					div("File sent")
				)
			),
			tr(
				th(
					div("Official")
				),
				td(
					div("24/07/2014 16:19:22")
				),
				td(
					div("Document accepted")
				)
			)
		)
	);
};
