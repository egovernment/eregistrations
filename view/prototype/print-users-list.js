'use strict';

exports.main = function () {
	table(
		{ class: 'print-users-list' },
		thead(
			tr(
				th({ colspan: 3 }, "Pending for revision", " ", span("(3)"))
			),
			tr(
				th("User"),
				th("Number"),
				th("Creation date")
			)
		),
		tbody(
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			)
		)
	);

	table(
		{ class: 'print-users-list' },
		thead(
			tr(
				th({ colspan: 3 }, "Sent for corrections", " ", span("(3)"))
			),
			tr(
				th("User"),
				th("Number"),
				th("Creation date")
			)
		),
		tbody(
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			)
		)
	);

	table(
		{ class: 'print-users-list' },
		thead(
			tr(
				th({ colspan: 3 }, "Rejected", " ", span("(3)"))
			),
			tr(
				th("User"),
				th("Number"),
				th("Creation date")
			)
		),
		tbody(
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			)
		)
	);

	table(
		{ class: 'print-users-list' },
		thead(
			tr(
				th({ colspan: 3 }, "Proccessing", " ", span("(3)"))
			),
			tr(
				th("User"),
				th("Number"),
				th("Creation date")
			)
		),
		tbody(
			tr(
				{ class: 'empty' },
				td({ colspan: 3 }, "There are no users at the moment.")
			)
		)
	);

	table(
		{ class: 'print-users-list' },
		thead(
			tr(
				th({ colspan: 3 }, "Approved", " ", span("(3)"))
			),
			tr(
				th("User"),
				th("Number"),
				th("Creation date")
			)
		),
		tbody(
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			),
			tr(
				td("John Watson", " - ", span('johnwatson@gmail.com')),
				td("123-234-342"),
				td("23/07/2014 18:09:22")
			)
		)
	);
};
