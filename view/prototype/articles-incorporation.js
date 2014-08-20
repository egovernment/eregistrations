'use strict';

exports['incorporation-tabs'] = function () {
	a({ class: 'tab', href: '/official/non-revision/user-id/' }, "Certificate of incorporation");
	a({ class: 'tab active' }, "Documents and data of petitioner");
	div(
		p("test")
	);
};
