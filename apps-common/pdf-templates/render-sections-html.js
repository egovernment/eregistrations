'use strict';

var debug               = require('debug-ext')('business-process-data-forms-print')
  , normalizeOptions    = require('es5-ext/object/normalize-options')
  , ensureNaturalNumber = require('es5-ext/object/ensure-natural-number-value')
  , template            = require('es6-template-strings')
  , encode              = require('ent').encode
  , renderers           = {};

renderers.value = function (data) {
	if (data && data.kind) {
		if (exports.customRenderers[data.kind]) {
			return exports.customRenderers[data.kind](data, renderers);
		}
		debug("Could not resolve " + JSON.stringify(data.kind) + " customisation renderer");
	}
	if (Array.isArray(data)) return encode(data.map(renderers.value).join(", "));
	return encode(data);
};

renderers.field = function (data) {
	return template("<tr><th>${ label }</th><td>${ value }</td></tr>", {
		label: encode(data.label),
		value: renderers.value(data.value)
	});
};

renderers.fields = function (data) {
	return template("<table><tbody>" + data.map(renderers.field).join('') + "</tbody></table>");
};

renderers.entity = function (data/*, options*/) {
	var options = normalizeOptions(arguments[1])
	  , headerRank;

	if (options.headerRank != null) {
		headerRank = Math.min(ensureNaturalNumber(options.headerRank), 6);
	} else {
		headerRank = 4;
	}
	options.headerRank = headerRank;

	return template("<li><h${ headerRank }>${ name }</h${ headerRank }>" +
		renderers.mainSections(data.sections, options) + "</li>", {
			headerRank: headerRank,
			name: encode(data.name)
		});
};

renderers.entities = function (data/*, options*/) {
	return "<ul class='entity-data-section-entities'>" + data.map(function (entityData) {
		return renderers.entity(entityData, arguments[1]);
	}).join('') + "</ul>";
};

renderers.subSection = function (data/*, options*/) {
	return renderers.section(data, 'entity-data-section-sub', arguments[1]);
};

renderers.subSections = function (data/*, options*/) {
	return data.map(function (sectionData) {
		return renderers.subSection(sectionData, arguments[1]);
	}).join('');
};

renderers.section = function (data, className/*, options*/) {
	var options      = normalizeOptions(arguments[2])
	  , disableLabel = Boolean(options.disableLabel)
	  , kind         = data.kind
	  , headerRank;

	delete options.disableLabel;

	if (kind && exports.customRenderers[kind]) {
		return exports.customRenderers[kind](data, className, options, renderers);
	}

	if (options.headerRank != null) {
		headerRank = Math.min(ensureNaturalNumber(options.headerRank), 6);
	} else {
		headerRank = 3;
	}
	options.headerRank = headerRank + 1;

	var result = template("<section class='${ className }'>", { className: className });

	if (!disableLabel && data.label) {
		result += template("<h${ headerRank }>${ label }</h${ headerRank }>", {
			headerRank: headerRank,
			label: encode(data.label)
		});
	}
	if (data.fields) result += renderers.fields(data.fields);
	if (data.entities) result += renderers.entities(data.entities, options);
	if (data.sections) result += renderers.subSections(data.sections, options);

	return result + "</section>";
};

renderers.mainSection = function (data/*, options*/) {
	return renderers.section(data, 'entity-data-section', arguments[1]);
};

renderers.mainSections = function (data/*, options*/) {
	return data.map(function (sectionData) {
		return renderers.mainSection(sectionData, arguments[1]);
	}).join('');
};

module.exports = exports = function (dataSnapshot/*, options*/) {
	var options = arguments[1];

	return renderers.mainSections(dataSnapshot.resolved, options);
};

exports.renderers = renderers;
exports.customRenderers = {
	fileValue: function (data) {
		return encode(data.name);
	}
};
