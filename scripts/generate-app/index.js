#!/usr/bin/env node
'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , fs            = require('fs2')
  , path          = require('path')
  , startsWith    = require('es5-ext/string/#/starts-with')
  , forEach       = require('es5-ext/object/for-each')
  , template      = require('es6-template-strings')
  , appName
  , hyphenedAppName
  , appTypes
  , templateType
  , templateVars = {}
  , appRootPath;

appTypes = {
	'users-admin': null,
	'meta-dmin': null,
	user: null,
	public: null,
	official: null,
	'business-process-submitted': { 'client/program.js': 'client/program.js/business-process.tpl' },
	'business-process': null
};

appName = process.argv[2];

if (!appName) {
	throw new Error('No appName argument provided');
}

hyphenedAppName   = camelToHyphen.call(appName);

templateVars.appName       = hyphenedAppName;
templateVars.appNameSuffix = hyphenToCamel.call(hyphenedAppName.split('-').slice(1).join('-'));
templateVars.isBusinessProcessSubmitted = hyphenedAppName === 'business-process-submitted';

forEach(appTypes, function (config, typeName) {
	if (templateType) return;
	if (hyphenedAppName === typeName) {
		templateType = typeName;
	}
	if (startsWith.call(hyphenedAppName, typeName)) {
		templateType = typeName;
	}
});

if (!templateType) {
	templateType = 'authenticated';
}

appRootPath = path.join(process.cwd(), hyphenedAppName);

var templates = {};

fs.readdir(path.join(__dirname, 'templates'),
	{ depth: Infinity, type: { file: true } }).then(function (files) {
	files.forEach(function (templatePath) {
		var fName = path.basename(templatePath, '.tpl')
		  , appPath = path.join(appRootPath, templatePath.split(path.sep).slice(0,
				-1).join(path.sep));

		if (fName === templateType) {
			templates[appPath] = path.join(__dirname, 'templates', templatePath);
		} else if (fName === 'authenticated' && !templates[appPath]) {
			templates[appPath] = path.join(__dirname, 'templates', templatePath);
		}
	});
	forEach(templates, function (templatePath, appPath) {
		fs.readFile(templatePath).then(function (fContent) {
			fContent = template(fContent, templateVars, { partial: true });
			fs.writeFile(appPath, fContent, { intermediate: true }).done(function (err) {
				if (err) throw err;
			});
		})().done(function (err) {
			if (err) throw err;
		});
	});
})().done(function (err) {
	if (err) throw err;
	console.log("Successfully created " + appName + " application. It's located in: " + appRootPath);
});
