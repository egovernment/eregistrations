/**
	* Used to generate data overview from sections.
	* This component should be used to display sections in part B.
*/

'use strict';

var normalizeOptions    = require('es5-ext/object/normalize-options')
  , ensureNaturalNumber = require('es5-ext/object/ensure-natural-number-value')

  , isArray = Array.isArray, min = Math.min, stringify = JSON.stringify
  , renderValue, renderField, renderFields, renderEntity, renderEntities
  , renderSection, renderMainSection, renderSubSection
  , renderMainSections, renderSubSections
  , defaultRenderers = {};

defaultRenderers.renderValue = renderValue = function (data) {
	if (data && data.kind) {
		if (exports.customRenderers[data.kind]) {
			return exports.customRenderers[data.kind](data, defaultRenderers);
		}
		console.error("Could not resolve " + stringify(data.kind) + " customisation renderer");
	}
	if (isArray(data)) return data.map(renderValue).join(", ");
	return data;
};

defaultRenderers.renderField = renderField = function (data) {
	return tr(th(data.label), td(renderValue(data.value)));
};

defaultRenderers.renderFields = renderFields = function (data) {
	return table(tbody(data.map(renderField)));
};

defaultRenderers.renderEntity = renderEntity = function (data, headerRank) {
	return li(ns['h' + headerRank](data.name), renderMainSections(data.sections, headerRank));
};

defaultRenderers.renderEntities = renderEntities = function (data, headerRank) {
	return ul({ class: 'entity-data-section-entities' },
		data, function (entityData) { return renderEntity(entityData, headerRank); });
};

defaultRenderers.renderSection = renderSection = function (data, className, headerRank) {
	if (data.kind && exports.customRenderers[data.kind]) {
		return exports.customRenderers[data.kind](data, className, headerRank, defaultRenderers);
	}
	return section({ class: className },
		data.label && ns['h' + headerRank](data.label),
		data.fields && renderFields(data.fields),
		data.entities && renderEntities(data.entities, min(headerRank + 1, 6)),
		data.sections && renderSubSections(data.sections, min(headerRank + 1, 6)));
};

defaultRenderers.renderMainSection = renderMainSection = function (data, headerRank) {
	return renderSection(data, 'entity-data-section', headerRank);
};

defaultRenderers.renderSubSection = renderSubSection = function (data, headerRank) {
	return renderSection(data, 'entity-data-section-sub', headerRank);
};

defaultRenderers.renderMainSections = renderMainSections = function (data, headerRank) {
	return data.map(function (sectionData) { return renderMainSection(sectionData, headerRank); });
};

defaultRenderers.renderSubSections = renderSubSections = function (data, headerRank) {
	return data.map(function (sectionData) { return renderSubSection(sectionData, headerRank); });
};

module.exports = exports = function (dataSnapshot/*, options*/) {
	var options = normalizeOptions(arguments[1]), headerRank;
	if (options.headerRank != null) headerRank = min(ensureNaturalNumber(options.headerRank), 6);
	if (!headerRank) headerRank = 3;
	return mmap(dataSnapshot._resolved, function (json) {
		if (!json) return;
		return renderMainSections(json, headerRank);
	});
};

exports.customRenderers = {
	fileValue: function (data) {
		return div({ class: 'file-thumb' },
			a({ href: data.url, target: '_blank', class: 'file-thumb-image' },
				img({ src: stUrl(data.thumbUrl) })),
			div({ class: 'file-thumb-actions' },
				span({ class: 'file-thumb-document-size' }, (data.diskSize / 1000000).toFixed(2) + ' Mo'),
				a({ href: data.url, target: '_blank', class: 'file-thumb-action' },
					span({ class: 'fa fa-download' }, "download"))));
	}
};
