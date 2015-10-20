// Configuration of view tree (relations between view files)

'use strict';

// Base markup (contains <head> and base <body> structure)
exports.base = {
	// Title of a page (Important for SEO, will be displayed in browser tab,
	// can be customized per view)
	title: "${ title }",
	// <head> content
	head: require('./html/head'),
	// <body> content
	body: require('./html/body')
};

// Homepage view
exports.home = {
	// Extends base view...
	_parent: exports.base,
	// ...changes content of <main> element to:
	main: require('./html/home'),
	body: {
		class: { inpage: true, homepage: true }
	}
};

// 404 page
exports.notFound = {
	// Extends base view...
	_parent: exports.base,
	// ...changes content of <main> element to:
	main: require('./html/404')
};

exports.contact = {
	_parent: exports.extrapages,
	main: require('./html/contact'),
	'btn-contact': {
		class: { active: true }
	},
	'btn-reset': {
		class: { hidden: true }
	}
};

exports.resetpswd = {
	_parent: exports.extrapages,
	main: require('./html/reset-password'),
	'btn-quienes': {
		class: { hidden: true }
	},
	'btn-contact': {
		class: { hidden: true }
	},
	'btn-reset': {
		class: { active: true }
	}
};
