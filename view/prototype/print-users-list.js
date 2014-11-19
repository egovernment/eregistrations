'use strict';

exports.body = function () {
	header(
		{ class: 'print-header' },
		img({ src: '/img/logo-2.png' }),
		div(
			h2("Revision"),
			p("19/11/2015")
		)
	);
	section(

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
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
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
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
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
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
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
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				),
				tr(
					td(
						a({ href: '/users-admin/user-id/' }, "John Watson",
							span('johnwatson@gmail.com')
							)
					),
					td(
						a({ href: '/users-admin/user-id/' }, "123-234-342")
					),
					td(
						a({ href: '/users-admin/user-id/' }, "23/07/2014 18:09:22")
					)
				)
			)
		)
	);
};
