'use strict';

var debug               = require('debug-ext')('business-process-data-forms-print')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , isString            = require('es5-ext/string/is-string')
  , repeat              = require('es5-ext/string/#/repeat')
  , template            = require('es6-template-strings')
  , encode              = require('ent').encode
  , renderers           = {};

var e = function (data) {
	return (data && isString(data)) ? encode(data) : data;
};

renderers.value = function (data) {
	if (data && data.kind) {
		if (exports.customRenderers[data.kind]) {
			return exports.customRenderers[data.kind](data, renderers);
		}
		debug("Could not resolve " + JSON.stringify(data.kind) + " customisation renderer");
	}
	if (Array.isArray(data)) return e(data.map(renderers.value).join(", "));
	return e(data);
};

renderers.field = function (data) {
	return template('<td><label>${ label }</label><span>${ value }</span></td>\n', {
		label: e(data.label),
		value: renderers.value(data.value)
	});
};

renderers.fields = function (data) {
	var result  = ''
	  , missing = 0;

	while (data.length) {
		missing = Math.max(4 - data.length, 0);
		result += '<tr>\n' + data.splice(0, 4).map(renderers.field).join('')
			+ repeat.call('<td></td>', missing) + '</tr>\n';
	}

	return result;
};

renderers.entity = function (data/*, options*/) {
	var options     = normalizeOptions(arguments[1])
	  , disableName = Boolean(options.disableName)
	  , kind        = data.kind
	  , result;

	delete options.disableName;

	if (kind && exports.customRenderers[kind]) {
		return exports.customRenderers[kind](data, options, renderers);
	}

	result = '';

	if (!disableName && data.name) {
		result += template('<tr>\n<td colspan="4" class="data-section-heading-subsection">${ name }' +
			'</td>\n</tr>\n', { name: e(data.name) });
	}

	return result + renderers.sections(data.sections, options);
};

renderers.entities = function (data/*, options*/) {
	return data.map(function (entityData) {
		return renderers.entity(entityData, arguments[1]);
	}).join('');
};

renderers.section = function (data/*, options*/) {
	var options      = normalizeOptions(arguments[1])
	  , disableLabel = Boolean(options.disableLabel)
	  , kind         = data.kind
	  , result;

	delete options.disableLabel;

	if (kind && exports.customRenderers[kind]) {
		return exports.customRenderers[kind](data, options, renderers);
	}

	result = '';

	if (!disableLabel && data.label) {
		result += template('<tr>\n<td colspan="4" class="data-section-heading-subsection">${ label }' +
			'</td>\n</tr>\n', { label: e(data.label) });
	}

	if (data.fields) result += renderers.fields(data.fields);
	if (data.entities) result += renderers.entities(data.entities, options);
	if (data.sections) result += renderers.sections(data.sections, options);

	return result;
};

renderers.sections = function (data/*, options*/) {
	return data.map(function (sectionData) {
		return renderers.section(sectionData, arguments[1]);
	}).join('');
};

renderers.mainSection = function (data/*, options*/) {
	var options      = normalizeOptions(arguments[1])
	  , disableLabel = Boolean(options.disableLabel)
	  , kind         = data.kind
	  , result;

	delete options.disableLabel;

	if (kind && exports.customRenderers[kind]) {
		return exports.customRenderers[kind](data, options, renderers);
	}

	result = '<table class="data-section" cellpadding="0" cellspacing="0">\n';

	if (!disableLabel && data.label) {
		result += template('<thead>\n<tr><th colspan="4" class="data-section-heading">${ label }' +
			'</th></tr>\n</thead>\n', { label: e(data.label) });
	}

	result += '<tbody>\n';
	if (data.fields) result += renderers.fields(data.fields);
	if (data.entities) result += renderers.entities(data.entities, options);
	if (data.sections) result += renderers.sections(data.sections, options);
	result += '</tbody>\n';

	return result + '</table>\n';
};

renderers.mainSections = function (data/*, options*/) {
	return data.map(function (sectionData) {
		return renderers.mainSection(sectionData, arguments[1]);
	}).join('');
};

module.exports = exports = function (dataSnapshot/*, options*/) {
	var options = arguments[1];

	return renderers.mainSections(dataSnapshot.sections, options);
};

exports.renderers = renderers;
exports.customRenderers = {
	fileValue: function (data) {
		return e(data.name);
	}
};
