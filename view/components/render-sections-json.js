/**
	* Used to generate data overview from sections.
	* This component should be used to display sections in part B.
*/

'use strict';

var normalizeOptions    = require('es5-ext/object/normalize-options')
  , ensureNaturalNumber = require('es5-ext/object/ensure-natural-number-value')
  , pathToUrl           = require('../../utils/upload-path-to-url')

  , isArray = Array.isArray, min = Math.min, stringify = JSON.stringify
  , renderValue, renderField, renderFields, renderEntity, renderEntities
  , renderSection, renderMainSection, renderSubSection
  , renderMainSections, renderSubSections
  , defaultRenderers = {};

defaultRenderers.value = renderValue = function (data) {
	if (data && data.kind) {
		if (exports.customRenderers[data.kind]) {
			return exports.customRenderers[data.kind](data, defaultRenderers);
		}
		console.error("Could not resolve " + stringify(data.kind) + " customisation renderer");
	}
	if (isArray(data)) return data.map(renderValue).join(", ");
	return data;
};

defaultRenderers.field = renderField = function (data) {
	return tr(th(data.label), td(renderValue(data.value)));
};

defaultRenderers.fields = renderFields = function (data) {
	return table(tbody(data.map(renderField)));
};

defaultRenderers.entity = renderEntity = function (data/*, options*/) {
	var options = normalizeOptions(arguments[1]), headerRank;
	if (options.headerRank != null) headerRank = min(ensureNaturalNumber(options.headerRank), 6);
	if (!headerRank) headerRank = 4;
	options.headerRank = headerRank;
	return li(ns['h' + headerRank](data.name), renderMainSections(data.sections, options));
};

defaultRenderers.entities = renderEntities = function (data/*, options*/) {
	var options = arguments[1];
	return ul({ class: 'entity-data-section-entities' },
		data, function (entityData) { return renderEntity(entityData, options); });
};

defaultRenderers = renderSection = function (data, className/*, options*/) {
	var options = arguments[2], headerRank, disableLabel;
	if (data.kind && exports.customRenderers[data.kind]) {
		return exports.customRenderers[data.kind](data, className, options, defaultRenderers);
	}
	options = normalizeOptions(options);
	if (options.headerRank != null) headerRank = min(ensureNaturalNumber(options.headerRank), 6);
	if (!headerRank) headerRank = 3;
	options.headerRank = min(headerRank + 1, 6);
	disableLabel = Boolean(options.disableLabel);
	delete options.disableLabel;
	return section({ class: className },
		disableLabel ? null : (data.label && ns['h' + headerRank](data.label)),
		data.fields && renderFields(data.fields),
		data.entities && renderEntities(data.entities, options),
		data.sections && renderSubSections(data.sections, options));
};

defaultRenderers.mainSection = renderMainSection = function (data/*, options*/) {
	return renderSection(data, 'entity-data-section', arguments[1]);
};

defaultRenderers.subSection = renderSubSection = function (data/*, options*/) {
	return renderSection(data, 'entity-data-section-sub', arguments[1]);
};

defaultRenderers.mainSections = renderMainSections = function (data/*, options*/) {
	var options = arguments[1];
	return data.map(function (sectionData) { return renderMainSection(sectionData, options); });
};

defaultRenderers.subSections = renderSubSections = function (data/*, options*/) {
	var options = arguments[1];
	return data.map(function (sectionData) { return renderSubSection(sectionData, options); });
};

module.exports = exports = function (dataSnapshot/*, options*/) {
	var options = arguments[1];
	return mmap(dataSnapshot._resolved, function (json) {
		if (!json) return;
		return renderMainSections(json, options);
	});
};

exports.renderers = defaultRenderers;
exports.customRenderers = {
	fileValue: function (data) {
		return div({ class: 'file-thumb' },
			a({ href: pathToUrl(data.path), target: '_blank', class: 'file-thumb-image' },
				img({ src: stUrl(pathToUrl(data.thumbPath)) })),
			div({ class: 'file-thumb-actions' },
				span({ class: 'file-thumb-document-size' }, (data.diskSize / 1000000).toFixed(2) + ' Mo'),
				a({ href: pathToUrl(data.path), target: '_blank', class: 'file-thumb-action',
					download: data.path }, span({ class: 'fa fa-download' }, "download"))));
	}
};