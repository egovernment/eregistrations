'use strict';

var assign = require('es5-ext/object/assign');

module.exports = function getDataFromSection(dataForm, result, typeMapper) {

	if (!result) result = {};

	var ownerType = dataForm.propertyMaster;

	// first try toWsSchemaJson method
	if (dataForm.toWebServiceSchemaJSON) {
		var dataFormResult = dataForm.toWebServiceSchemaJSON(typeMapper);
		return assign(result, dataFormResult);
	}

	// if tabular section
	if (dataForm.propertyName) {

		// exclude customs
		if (!ownerType.get(dataForm.propertyName)
				|| !ownerType.get(dataForm.propertyName).getItemType) {
			return;
		}

		var formOwner = ownerType.get(dataForm.propertyName).getItemType();
		if (formOwner.prototype.dataForms && formOwner.prototype.dataForms.size) {
			formOwner.prototype.dataForms.map.forEach(function (subForm) {
				result[dataForm.propertyName] = {};
				result[dataForm.propertyName].type = "array";
				result[dataForm.propertyName].items = { type: "object", properties: { } };

				getDataFromSection(subForm, result[dataForm.propertyName].items.properties, typeMapper);

			});
		}
	} else {
		(dataForm.propertyNames || []).forEach(function (prop) {
			// split props
			var props = prop.split("/");
			var master = ownerType;
			props.reduce(function (res, p, index) {
				if (!res[p]) res[p] = {};
				var descriptor = master.getDescriptor(p);
				// type -#TODO treat it nicely
				res[p].type = typeMapper.mapType(descriptor.type);
				if (res[p].type === 'enum') res[p].ref = descriptor.type.__id__;

				// label
				res[p].label = descriptor.label;
				// required
				if (descriptor.required) res[p].required = true;
				if (index !== props.length - 1) {
					if (!res[p].properties) res[p].properties = { };
				}
				// go in depth
				master = master[p];
				return res[p].properties;
			}, result);
		});
	}
	return result;
};
