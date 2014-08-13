'use strict';

var db = require('mano').db,
	user = db.User.prototype;

exports['sub-main'] = function () {
	section(
		{ class: 'section-primary' },
		div(
			h3("User informations"),
			hr()
		)
	);
};
