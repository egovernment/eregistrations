'use strict';

var ensureDb = require('dbjs/valid-dbjs')
  , getTypeMapper = require('./type-mapper')
  , memoize = require('memoizee');

function getDataFromSection(dataForm, result, typeMapper) {

	if (!result) result = {};

	var ownerType = dataForm.propertyMaster;

	// first try toWsSchemaJson method
	if (dataForm.toWebServiceSchemaJson) {
		result = dataForm.toWebServiceSchemaJson();
		return result;
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
}

function getDataFromProcessingStep(step, db, typeMapper) {

	var stepData = {};

	stepData.type = "object";
	stepData.label = step.label;
	stepData.properties = {};
	stepData.properties.status = {};
	stepData.properties.status.type = "enum";
	stepData.properties.status.ref = "ProcessingStepStatus";
	stepData.properties.statusTimestamp = {};
	stepData.properties.statusTimestamp.type = "timestamp";
	stepData.properties.statusTimestamp.required = true;
	stepData.properties.required = true;

	// data form
	var hasForm = step.dataForm && step.dataForm.propertyNames && step.dataForm.propertyNames.size;

	if (hasForm) {
		stepData.properties.data = {};
		getDataFromSection(step.dataForm, stepData.properties.data, typeMapper);
	}

	return stepData;
}

module.exports = memoize(function (db, customCatalogs) {
	// ensure db
	ensureDb(db);

	var typeMapper = getTypeMapper(db, customCatalogs);

	var schema = [];

	// get all business process extension
	db.BusinessProcess.extensions.forEach(function (service) {
		var serviceDefinition = {};
		serviceDefinition.typeName = service.__id__;
		serviceDefinition.properties = {};

		// basic
		serviceDefinition.properties.id = { type: "string", required: "true" };
		serviceDefinition.properties.service = { type: "enum", ref: "services", required: true };
		serviceDefinition.properties.submittedTimespamp = { type: "timestamp", required: true };

		// processing steps
		serviceDefinition.properties.processingSteps = {};
		serviceDefinition.properties.processingSteps.type = "object";
		serviceDefinition.properties.processingSteps.properties = {};
		service.prototype.processingSteps.map.forEach(function (step) {
			// check if it is a group
			if (step.steps) {
				step.steps.map.forEach(function (subStep) {
					serviceDefinition.properties.processingSteps
						.properties[subStep.key] = getDataFromProcessingStep(subStep, db, typeMapper);
				});
			} else {
				serviceDefinition.properties.processingSteps
					.properties[step.key] = getDataFromProcessingStep(step, db, typeMapper);
			}
		});
		var requestData = serviceDefinition.properties.request = {};
		requestData.type = "object";
		requestData.properties = {};
		// certificates
		var certificates = requestData.properties.certificates = {};
		certificates.type = "array";
		certificates.items = {};
		certificates.items.type = "object";
		certificates.items.properties = {};
		certificates.items.properties.code = {};
		certificates.items.properties.code.type = "enum";
		certificates.items.properties.code.ref = "documents";
		certificates.items.properties.code.required = true;
		certificates.items.properties.files = {};
		certificates.items.properties.files.type = "array";
		certificates.items.properties.files.items = {};
		certificates.items.properties.files.items.type = "object";
		certificates.items.properties.files.items.properties = { };
		certificates.items.properties.files.items.properties.url = { type: "string" };
		certificates.items.properties.owner = {};
		certificates.items.properties.owner.type = "string";
		certificates.items.properties.owner.required = true;
		certificates.items.properties.data = {};
		certificates.items.properties.data.type = "object";
		certificates.items.properties.data.properties = {};

		// iterate thru all certificate types and make a union of all data
		service.prototype.certificates.map.forEach(function (cer) {
			if (cer.dataForm) {
				getDataFromSection(cer.dataForm, certificates.items.properties.data.properties, typeMapper);
			}
		});

		// registrations
		var registrations = requestData.properties.registrations = {};
		registrations.type = "array";
		registrations.items = {};
		registrations.items.type = "object";
		registrations.items.properties = {};
		registrations.items.properties.code = {};
		registrations.items.properties.code.type = "enum";
		registrations.items.properties.code.ref = "registrations";
		registrations.items.properties.code.required = true;

		// costs
		var costs = requestData.properties.costs = {};
		costs.type = "array";
		costs.items = {};
		costs.items.type = "object";
		costs.items.properties = {};
		costs.items.properties.code = {};
		costs.items.properties.code.type = "enum";
		costs.items.properties.code.ref = "costs";
		costs.items.properties.code.required = true;
		costs.items.properties.amount = {};
		costs.items.properties.amount.type = "number";
		costs.items.properties.amount.required = true;

		// document uploads - has data form
		var documentUploads = requestData.properties.documentUploads = {};
		documentUploads.type = "array";
		documentUploads.items = {};
		documentUploads.items.type = "object";
		documentUploads.items.properties = {};
		documentUploads.items.properties.code = {};
		documentUploads.items.properties.code.type = "enum";
		documentUploads.items.properties.code.ref = "documents";
		documentUploads.items.properties.code.required = true;
		documentUploads.items.properties.files = {};
		documentUploads.items.properties.files.type = "array";
		documentUploads.items.properties.files.items = {};
		documentUploads.items.properties.files.items.type = "object";
		documentUploads.items.properties.files.items.properties = { };
		documentUploads.items.properties.files.items.properties.url = { type: "string" };
		documentUploads.items.properties.owner = {};
		documentUploads.items.properties.owner.type = "string";
		documentUploads.items.properties.owner.required = true;

		documentUploads.items.properties.data = {};
		documentUploads.items.properties.data.type = "object";
		documentUploads.items.properties.data.properties = {};

		// iterate thru all doc uploads types and make a union of all data
		service.prototype.requirementUploads.map.forEach(function (cer) {
			if (cer.dataForm) {
				getDataFromSection(cer.dataForm =
					documentUploads.items.properties.data.properties, typeMapper);
			}
		});

		// payments - has data form
		var payments = requestData.properties.payments = {};
		payments.type = "array";
		payments.items = {};
		payments.items.type = "object";
		payments.items.properties = {};
		payments.items.properties.code = {};
		payments.items.properties.code.type = "enum";
		payments.items.properties.code.ref = "documents";
		payments.items.properties.code.required = true;
		payments.items.properties.files = {};
		payments.items.properties.files.type = "array";
		payments.items.properties.files.items = {};
		payments.items.properties.files.items.type = "object";
		payments.items.properties.files.items.properties = { };
		payments.items.properties.files.items.properties.url = { type: "string" };
		payments.items.properties.owner = {};
		payments.items.properties.owner.type = "string";
		payments.items.properties.owner.required = true;

		payments.items.properties.data = {};
		payments.items.properties.data.type = "object";
		payments.items.properties.data.properties = {};

		// iterate thru all payment types and make a union of all data
		service.prototype.paymentReceiptUploads.map.forEach(function (cer) {
			if (cer.dataForm) {
				getDataFromSection(cer.dataForm, payments.items.properties.data.properties, typeMapper);
			}
		});

		// data
		var dataContent = requestData.properties.data = {};
		dataContent.type = "object";
		dataContent.properties = {};
		// guide
		getDataFromSection(service.prototype.determinants, dataContent.properties, typeMapper);
		// forms
		if (service.prototype.dataForms.map && service.prototype.dataForms.map.size) {
			service.prototype.dataForms.map.forEach(function (form) {
				getDataFromSection(form, dataContent.properties, typeMapper);
			});
		}
		schema.push(serviceDefinition);
	});

	return schema;

}, { length: 0 });
