#!/usr/bin/env node

'use strict';

var normalizeOptions  = require('es5-ext/object/normalize-options')
  , capitalize        = require('es5-ext/string/#/capitalize')
  , hyphenToCamel     = require('es5-ext/string/#/hyphen-to-camel')
  , template          = require('es6-template-strings')
  , deferred          = require('deferred')
  , fs                = require('fs2')
  , path              = require('path')
  , exec              = deferred.promisify(require('child_process').execFile)
  , generateAppsList  = require('mano/scripts/generate-apps-list')
  , generateAppsConf  = require('mano/scripts/generate-apps-conf')
  , getApps           = require('mano/server/utils/resolve-apps');

var appTypes = {
	'users-admin': true,
	'meta-admin': { extraFiles: ['view/meta-admin'] },
	dispatcher: { extraFiles: ['view/dispatcher'],
		'client/model.js': 'client/model.js/official.tpl',
		'client/dbjs-dom.js': 'client/dbjs-dom.js/official.tpl'
		},
	supervisor: {
		'client/model.js': 'client/model.js/official.tpl'
	},
	user: { extraFiles: ['view/user.js'] },
	public: { extraFiles: ['apps/public'] },
	official: true,
	'business-process-submitted': { 'client/program.js': 'client/program.js/business-process.tpl' },
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
	  , appRootPath, templateVars = {}, findTemplate;

	appRootPath = path.resolve(projectRoot, 'apps', appName);
	extraFilesPath    = path.join(__dirname, 'extra-files');

	templateVars.appName       = appName;
	templateVars.className     = capitalize.call(hyphenToCamel.call(appName));
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
	templateVars.appNameSuffix = hyphenToCamel.call(appName.replace(templateType + '-', ''));

	var templates = {};

	findTemplate = function (appPath, fName, templates, templatePath) {
		var partialAppName = appName, i = 0;
		if (templates[appPath] && path.basename(templates[appPath]) !== 'authenticated.tpl') return;
		while (partialAppName) {
			if (fName === partialAppName) {
				templates[appPath] = path.join(__dirname, 'templates', templatePath);
				return;
			}
			--i;
			partialAppName = appName.split('-').slice(0, i).join('-');
		}
	};

	return exec('node',
		[path.resolve(projectRoot, 'bin', 'adapt-app'), 'apps' + path.sep + appName],
		{ cwd: projectRoot }).then(function () {
		return fs.readdir(path.join(__dirname, 'templates'),
				{ depth: Infinity, type: { file: true } }).map(
			function (templatePath) {
				var fName = path.basename(templatePath, '.tpl')
			  , appPathRel = path.dirname(templatePath)
			  , appPath = path.join(appRootPath, appPathRel);

				if (appTypes[templateType] && appTypes[templateType][appPathRel] === templatePath) {
					templates[appPath] = path.join(__dirname, 'templates', templatePath);
					return;
				}
				if (fName === 'authenticated' && !templates[appPath]) {
					templates[appPath] = path.join(__dirname, 'templates', templatePath);
					return;
				}
				if (templateType === 'official') {
					findTemplate(appPath, fName, templates, templatePath);
					return;
				}
				if (fName === templateType) {
					templates[appPath] = path.join(__dirname, 'templates', templatePath);
				}
			}
		);
	}).then(function () {
		return fs.readdir(path.join(__dirname, 'extra-templates'),
				{ depth: Infinity, type: { file: true } }).map(
			function (templatePath) {
				var fName = path.basename(templatePath, '.tpl')
				  , projectPath = path.dirname(path.join(projectRoot,
						templatePath.replace('appname', templateVars.appName)));
				if (fName === templateType) {
					templates[projectPath] = path.join(__dirname, 'extra-templates', templatePath);
				}
			}
		);
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
