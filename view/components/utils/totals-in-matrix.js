'use strict';

var ensureArray  = require('es5-ext/array/valid-array')
  , ensureObject = require('es5-ext/object/valid-object')
  , generateId   = require('dom-ext/html-document/generate-id');

var generateTableBody = function (rows, master) {
	return rows.map(function (row) {
		return tr(th(row.label, span({ class: 'hint' }, row.inputHint)),
			list(row.paths, function (path) {
				var resolved = master.resolveSKeyPath(path);
				return td(
					input({ id: 'matrix-display-input-' + path,
						dbjs: resolved.observable, required: false })
				);
			}),
			td({ id: row.totalId }));
	});
};

module.exports = function (config) {
	var i, horizontalTotal, horizontalTotals = [], verticalTotals = [], totalId,
		rows, columnLabels, lastRowLabel, tableId, master, formId;
	ensureObject(config);
	rows         = ensureArray(config.rows);
	columnLabels = ensureArray(config.columnLabels);
	lastRowLabel = config.lastRowLabel;
	master       = ensureObject(config.master);
	tableId      = config.tableId || generateId();
	formId       = config.formId;

	totalId = generateId('total');
	//vertical totals
	rows.forEach(function (row) {
		var verticalTotal = {
			totalId: generateId('total'),
			paths: row.paths
		};
		verticalTotals.push(verticalTotal);
		row.totalId = verticalTotal.totalId;
	});
	//horizontal totals
	var addPath = function (row) {
		horizontalTotal.paths.push(row.paths[i]);
	};
	for (i = 0; i < rows[0].paths.length; i++) {
		horizontalTotal = {
			totalId: generateId('total'),
			paths: []
		};
		rows.forEach(addPath);
		horizontalTotals.push(horizontalTotal);
	}

	return table({ id: tableId },
		thead(tr(
			th(),
			list(columnLabels, function (label) {
				return th(label);
			})
		)),
		tbody(generateTableBody(rows, master)),
		tfoot(tr(
			th(lastRowLabel),
			list(horizontalTotals, function (horizontalTotal) {
				return td({ id: horizontalTotal.totalId });
			}),
			td({ id: totalId })
		)),

		script(function (formId, horizontalTotals, verticalTotals, totalId) {
			var form = $(formId), totals = [], fullTotal = { total: $(totalId), subTotals: [] };
			horizontalTotals.concat(verticalTotals).forEach(function (total) {
				totals.push({
					total: $(total.totalId),
					subTotals: total.paths.map(function (path) {
						return $('matrix-display-input-' + path);
					})
				});
			});
			verticalTotals.forEach(function (total) {
				fullTotal.subTotals = fullTotal.subTotals.concat(total.paths.map(function (path) {
					return $('matrix-display-input-' + path);
				}));
			});
			totals.push(fullTotal);

			$.onEnvUpdate(form, function () {
				totals.forEach(function (total) {
					var sum = 0;
					total.subTotals.forEach(function (subTotal) {
						sum += (subTotal.value ? Number(subTotal.value) : 0);
					});
					total.total.innerText = sum.toLocaleString();
				});
			});
		}, formId, horizontalTotals, verticalTotals, totalId));
};
