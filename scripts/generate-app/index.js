#!/usr/bin/env node

'use strict';

var capitalize        = require('es5-ext/string/#/capitalize')
  , uncapitalize      = require('es5-ext/string/#/uncapitalize')
  , startsWith        = require('es5-ext/string/#/starts-with')
  , hyphenToCamel     = require('es5-ext/string/#/hyphen-to-camel')
  , normalizeOptions  = require('es5-ext/object/normalize-options')
  , Set               = require('es6-set')
  , template          = require('es6-template-strings')
  , deferred          = require('deferred')
  , fs                = require('fs2')
  , path              = require('path')
  , exec              = deferred.promisify(require('child_process').execFile)
  , generateAppsList  = require('mano/scripts/generate-apps-list')
  , generateAppsConf  = require('mano/scripts/generate-apps-conf')
  , getApps           = require('mano/server/utils/resolve-apps')

  , templatesPath = path.resolve(__dirname, 'templates')
  , extraTemplatesPath = path.resolve(__dirname, 'extra-templates');

var appTypes = {
	'users-admin': true,
	statistics: true,
	'meta-admin': { extraFiles: ['view/meta-admin'] },
	dispatcher: { extraFiles: ['view/dispatcher'] },
	user: { extraFiles: ['view/user.js'] },
	public: { extraFiles: ['apps/public'] },
	official: true,
	'official-revision': true,
	'business-process': true,
	'manager-registration': true,
	manager: true
};

var copyExtraFile = function (projectRoot, extraPath) {
	return fs.copy(path.resolve(extraPath),
		path.join(projectRoot, extraPath.split('extra-files/').slice(-1)[0]),
		{ intermediate: true });
};

module.exports = function (projectRoot, appName/*, options*/) {
	var options = normalizeOptions(arguments[2]), extraFilesPath, partialAppName, templateType
	  , appRootPath, templateVars = {};

	appRootPath = path.resolve(projectRoot, 'apps', appName);
	extraFilesPath    = path.join(__dirname, 'extra-files');

	templateVars.appName       = appName;
	templateVars.className     = capitalize.call(hyphenToCamel.call(appName));
	if (startsWith.call(templateVars.className, 'BusinessProcess')) {
		templateVars.classPostfix
			= uncapitalize.call(templateVars.className.slice('BusinessProcess'.length));
		templateVars.appNamePostfix = templateVars.appName.slice('business-process-'.length);
	}
	templateVars.isBusinessProcessSubmitted = appName === 'business-process-submitted';

	if (appTypes[appName]) {
		templateType = appName;
	} else {
		var i = 0;
		do {
			--i;
			partialAppName = appName.split('-').slice(0, i).join('-');
			if (appTypes[partialAppName]) {
				templateType = partialAppName;
				break;
			}
		} while (partialAppName);
		if (!templateType) {
			templateType = 'authenticated';
		}
	}
	if (templateType === 'official-revision') {
		templateVars.appNameSuffix = hyphenToCamel.call(appName.replace('official-', ''));
	} else {
		templateVars.appNameSuffix = hyphenToCamel.call(appName.replace(templateType + '-', ''));
	}

	var templates = {};

	var scriptArgs = [path.resolve(projectRoot, 'bin', 'adapt-app'), 'apps' + path.sep + appName];
	return exec('node', scriptArgs, { cwd: projectRoot }).then(function () {
		var opts = { depth: Infinity, type: { directory: true } };
		return fs.readdir(templatesPath, opts).map(function (directoryPath) {
			var opts = { type: { file: true }, pattern: /\.tpl$/ };
			return fs.readdir(path.resolve(templatesPath, directoryPath), opts)(function (templateNames) {
				var appPathTokens = appName.split('-'), templateName;
				templateNames = new Set(templateNames.map(function (name) {
					return name.slice(0, -'.tpl'.length);
				}));
				while (true) {
					templateName = appPathTokens.join('-');
					if (templateNames.has(templateName)) break;
					appPathTokens.pop();
					if (!appPathTokens.length) {
						templateName = templateNames.has('authenticated') ? 'authenticated' : null;
						break;
					}
				}
				if (templateName) {
					templates[path.resolve(appRootPath, directoryPath)] =
						path.resolve(templatesPath, directoryPath, templateName + '.tpl');
				}
			});
		});
	}).then(function () {
		var opts = { depth: Infinity, type: { directory: true } };
		return fs.readdir(extraTemplatesPath, opts).map(function (directoryPath) {
			var opts = { type: { file: true }, pattern: /\.tpl$/ }
			  , fullPath = path.resolve(extraTemplatesPath, directoryPath);
			return fs.readdir(fullPath, opts)(function (templateNames) {
				var appPathTokens = appName.split('-'), templateName;
				templateNames = new Set(templateNames.map(function (name) {
					return name.slice(0, -'.tpl'.length);
				}));
				while (true) {
					templateName = appPathTokens.join('-');
					if (templateNames.has(templateName)) break;
					appPathTokens.pop();
					if (!appPathTokens.length) {
						templateName = templateNames.has('authenticated') ? 'authenticated' : null;
						break;
					}
				}
				if (templateName) {
					templates[path.resolve(projectRoot,
						directoryPath.replace('appname', templateVars.appName))] =
						path.resolve(extraTemplatesPath, directoryPath, templateName + '.tpl');
				}
			});
		});
	}).then(function () {
		var toResolve = [deferred.map(Object.keys(templates), function (appPath) {
			return fs.readFile(templates[appPath])(function (fContent) {
				var opts = { intermediate: true };
				fContent = template(fContent, templateVars, { partial: true });
				if (path.basename(path.dirname(appPath)) === 'bin') {
					opts.mode = 511;
				}
				return fs.writeFile(appPath, fContent, opts);
			})();
		})];
		if (appTypes[templateType] && appTypes[templateType].extraFiles) {
			var paths = appTypes[templateType].extraFiles.map(function (extraFile) {
				return path.join(extraFilesPath, extraFile);
			});
			toResolve.push(deferred.map(paths, function (extraPath) {
				return fs.stat(extraPath).then(function (stat) {
					if (stat.isDirectory()) {
						return fs.readdir(extraPath,
							{ depth: Infinity, type: { file: true } }).map(function (extraFile) {
							return copyExtraFile(projectRoot, path.join(extraPath, extraFile));
						});
					}
					return copyExtraFile(projectRoot, extraPath);
				});
			}));
		}
		return deferred.map(toResolve);
	}).then(function () {
		if (options.appFilesOnly) return;
		return deferred(
			generateAppsList(projectRoot),
			getApps(projectRoot).then(function (appsList) {
				return generateAppsConf(projectRoot, appsList);
			})
		);
	});
};
