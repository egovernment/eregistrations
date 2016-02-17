'use strict';

if (!process.env.DEBUG) {
	process.env.DEBUG = '*,-' + [
		'body-parser:urlencoded',
		'compression',
		'connect:dispatcher',
		'node-soap',
		'time'
	].join(',-');
}
