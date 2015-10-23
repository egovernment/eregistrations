#!/usr/bin/env node
'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , hyphenToCamel = require('es5-ext/string/#/hyphen-to-camel')
  , fs            = require('fs')
  , path          = require('path')
  , startsWith    = require('es5-ext/string/#/starts-with')
  , endsWith      = require('es5-ext/string/#/ends-with')
  , template      = require('es6-template-strings')
  , forEach       = require('es5-ext/object/for-each')
  , appName
  , hyphenedAppName
  , appTypes
  , templateType
  , templateVars = {}
  , createFromTemplates
  , createAppDirectories
  , isPathToFile
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

isPathToFile = function (dirPath) {
	if (!dirPath) return false;
	return path.extname(dirPath) || startsWith.call(path.basename(dirPath), '.');
};

createAppDirectories = function (dirPath, callback) {
	fs.stat(dirPath, function (err) {
		if (err == null) {
			callback(dirPath);
		} else if (err.code === 'ENOENT') {
			var pathArr = dirPath.split(path.sep), subPath;
			pathArr.pop();
			subPath = path.join(pathArr.join(path.sep));
			fs.stat(subPath, function (err) {
				if (err == null) {
					if (isPathToFile(dirPath)) {
						fs.open(dirPath, 'w+', function (err) {
							if (err) {
								throw err;
							}
							callback(dirPath);
						});
					} else {
						fs.mkdir(dirPath, function (err) {
							if (err && err.code === 'EEXIST') {
								callback(dirPath);
								return;
							}
							if (err) {
								throw err;
							}
							callback(dirPath);
						});
					}
				} else if (err && err.code === 'ENOENT') {
					createAppDirectories(subPath, function () {
						createAppDirectories(dirPath, callback);
					});
				} else {
					throw err;
				}
			});
		}
	});
};
var t = 1;
createFromTemplates = function (templatePath) {
	if (!templatePath) {
		templatePath = 'templates';
	}
	fs.readdir(path.join(__dirname, templatePath), function (err, files) {
		if (err) {
			throw err;
		}
		files.sort(function (a, b) { return a.localeCompare(b); }).forEach(function (file) {
			var fPath = path.join(__dirname, templatePath, file)
			  , fName = file.replace(/\.tpl/, '')
			  , dirPath;
			fs.stat(fPath, function (err, stat) {
				if (err) {
					throw err;
				}
				if (stat.isDirectory()) {
					createFromTemplates(path.join(templatePath, file));
					return;
				}
				if (templateType === fName || fName === 'authenticated') {
					dirPath = path.join(appRootPath,
						fPath.split('generate-app' + path.sep + 'templates')[1].slice(0, -(file.length + 1)));
					createAppDirectories(dirPath, function (dirPath) {
						if (isPathToFile(dirPath)) {
							// check if we override template path
							if (appTypes[templateType]) {
								forEach(appTypes[templateType], function (templatePath, key) {
									if (endsWith.call(dirPath, key)) {
										fPath = path.join(fPath.split('/templates/')[0], 'templates', templatePath);
									}
								});
							}
							setTimeout(function () {
								fs.readFile(fPath, function (err, fContent) {
										if (err) throw err;
									fContent = template(fContent, templateVars, { partial: true });
									fs.writeFile(dirPath, fContent, function (err) {
											if (err) throw err;
									});
								});
							}, t += 10
						);
						}
					});
				}
			});
		});
	});
};

createFromTemplates();
