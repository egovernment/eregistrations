#!/usr/bin/env node
'use strict';

var camelToHyphen = require('es5-ext/string/#/camel-to-hyphen')
  , fs            = require('fs')
  , path          = require('path')
  , startsWith    = require('es5-ext/string/#/starts-with')
  , template      = require('es6-template-strings')
  , appName
  , hyphenedAppName
  , appTypes
  , templateType
  , templateVars = {}
  , createFromTemplates
  , createAppDirectories
  , isPathToFile
  , appRootPath;

appTypes = ['users-admin', 'meta-dmin', 'user', 'public', 'official',
	'business-process-submitted', 'business-process'];

appName = process.argv[2];

if (!appName) {
	throw new Error('No appName argument provided');
}

hyphenedAppName   = camelToHyphen.call(appName);

templateVars.appName       = hyphenedAppName;
templateVars.appNameSuffix = hyphenedAppName;

appTypes.some(function (typeName) {
	if (hyphenedAppName === typeName) {
		templateType = typeName;
		return true;
	}
	if (startsWith.call(hyphenedAppName, typeName)) {
		templateType = typeName;
		return true;
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
							fs.readFile(fPath, function (err, fContent) {
								if (err) throw err;
								fContent = template(fContent, templateVars, { partial: true });
								fs.writeFile(dirPath, fContent, function (err) {
									if (err) throw err;
								});
							});
						}
					});
				}
			});
		});
	});
};

createFromTemplates();
