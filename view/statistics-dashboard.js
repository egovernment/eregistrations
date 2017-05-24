'use strict';

var assign              = require('es5-ext/object/assign')
  , copy                = require('es5-ext/object/copy')
  , capitalize          = require('es5-ext/string/#/capitalize')
  , uncapitalize        = require('es5-ext/string/#/uncapitalize')
  , Duration            = require('duration')
  , memoize             = require('memoizee')
  , ObservableValue     = require('observable-value')
  , nextTick            = require('next-tick')
  , _                   = require('mano').i18n.bind('View: Statistics')
  , location            = require('mano/lib/client/location')
  , getData             = require('mano/lib/client/xhr-driver').get
  , db                  = require('../db')
  , setupQueryHandler   = require('../utils/setup-client-query-handler')
  , resolveFullStepPath = require('../utils/resolve-processing-step-full-path')
  , getQueryHandlerConf = require('../apps/statistics/get-query-conf')
  , frontDeskNames      = require('./utils/front-desk-names')
  , dateFromToBlock     = require('./components/filter-bar/select-date-range-safe-fallback')
  , observableResult    = new ObservableValue()
  , toArray             = require('es5-ext/object/to-array')
  , toDateInTz          = require('../utils/to-date-in-time-zone')
  , initTableSortingOnClient = require('./utils/init-table-sorting-on-client')
  , completedFilesPeriods = [
	{ name: 'inPeriod', label: _("Period") },
	{ name: 'today', label: _("Today") },
	{ name: 'thisWeek', label: _("This week") },
	{ name: 'thisMonth', label: _("This month") }
];

var today = toDateInTz(new Date(), db.timeZone);
var currentYear = new db.Date(today.getUTCFullYear(), 0, 1);
var lastYearInRange = new db.Date(today.getUTCFullYear() - 5, 0, 1);

while (currentYear >= lastYearInRange) {
	completedFilesPeriods.push({
		name: currentYear.getUTCFullYear(),
		label: currentYear.getUTCFullYear()
	});
	currentYear.setUTCFullYear(currentYear.getUTCFullYear() - 1);
}

exports._servicesColors  = ["#673AB7", "#FFC107", "#FF4B4B", "#3366CC"];
exports._stepsColors     = ["#673AB7", "#FFC107", "#FF4B4B", "#3366CC"];
exports._customChartsDOM     = Function.prototype;
exports._customChartsGetData = Function.prototype;

exports._commonOptions = {
	colors: exports._servicesColors, // by default colors of the services
	animation: {
		startup: true,
		duration: 1200,
		easing: "in"
	},
	legend: { position: "bottom", maxLines: 3 },
	chartArea: { width: "100%", height: "75%" },
	height: 300,
	is3D: false,
	isStacked: true,
	titlePosition: "out",
	axisTitlesPosition: "in",
	vAxis: {
		textPosition: "in",
		viewWindow: { min: 0 },
		minValue: 0
	},
	width: "100%"
};

var getTimeBreakdownTable = function (bpData) {
	return table(
		{ class: 'statistics-table statistics-table-registrations' },
		thead(tr(
			th({ class: 'statistics-table-header-waiting' }, _("Service")),
			list(completedFilesPeriods, function (period) {
				return th({ class: 'statistics-table-number' }, period.label);
			})
		)),
		tbody(
			mmap(bpData, function (data) {
				if (!data) return;

				return [
					toArray(data.byService, function (serviceData, serviceName) {
						return tr(
							td(db['BusinessProcess' + capitalize.call(serviceName)].prototype.label),
							list(completedFilesPeriods, function (period) {
								var count = serviceData[period.name];

								return td({ class: 'statistics-table-number' }, count);
							})
						);
					}),
					tr(
						td(_("Total")),
						list(completedFilesPeriods, function (period) {
							return td({ class: 'statistics-table-number' },
								data.total[period.name]);
						})
					)
				];
			})
		)
	);
};

var queryServer = memoize(function (query) {
	return getData('/get-dashboard-data/', query);
}, {
	normalizer: function (args) { return JSON.stringify(args[0]); },
	max: 1000
});

var getServiceNames = function () {
	var services = {};

	db.BusinessProcess.extensions.forEach(function (BusinessProcessClass) {
		services[uncapitalize.call(BusinessProcessClass.__id__.slice('BusinessProcess'.length))] =
			{ label: BusinessProcessClass.prototype.label };
	});

	return services;
};

var dayRangeConfig = {
	31: 1,
	182: 7,
	365: 30,
	Infinity: 365
};

var getGroupByCount = function (dateFrom, dateTo) {
	var duration, groupBy;
	duration = new Duration(dateFrom, dateTo);

	Object.keys(dayRangeConfig).some(function (rangeKey) {
		if (duration.days <= rangeKey) {
			groupBy = dayRangeConfig[rangeKey];
			return true;
		}
	});

	return groupBy;
};

var getStepLabelByShortPath = function (processingStepsMeta) {
	return function (shortStepPath) {
		return db['BusinessProcess' +
			capitalize.call(processingStepsMeta[shortStepPath]._services[0])].prototype
			.processingSteps.map.getBySKeyPath(resolveFullStepPath(shortStepPath)).label;
	};
};

var getFilesCompletedPerDay = function (data, query) {
	var result = { handle: 'chart-files-completed-per-day' };
	var chart = {
		options: assign(copy(exports._commonOptions), {
			orientation: 'horizontal',
			legend: { position: "top" }
		}),
		data: [["Service"]]
	};
	var days = Object.keys(data).sort()
	  , dateFrom, dateTo, dateFromStr, rowData, rangeKey, groupByCount
	  , daysCount = 0, currentRange
	  , setupRange, addAmountToRange, setupRowData;

	if (!days || !days.length) {
		result.data = null;
		return result;
	}
	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	dateFrom = query.dateFrom || new Date(Date.parse(days[0]));
	dateTo = query.dateTo || new db.Date();
	groupByCount = getGroupByCount(dateFrom, dateTo);

	setupRange = function (currentRange) {
		Object.keys(services).forEach(function (serviceName) {
			currentRange.services[serviceName] = 0;
		});
	};

	addAmountToRange = function (currentRange, dateFromStr) {
		Object.keys(services).forEach(function (serviceName) {
			var amount;
			amount = data[dateFromStr][serviceName];
			currentRange.services[serviceName] += amount;
		});
	};

	setupRowData = function (currentRange, rowData) {
		Object.keys(currentRange.services).forEach(function (service) {
			rowData.push(currentRange.services[service] || 0);
		});
	};
	while (dateFrom <= dateTo) {
		daysCount++;
		dateFromStr = dateFrom.toISOString().slice(0, 10);
		if (!currentRange) {
			currentRange = { name: dateFrom.toLocaleDateString(db.locale), services: {} };
			setupRange(currentRange);
		}
		if (data[dateFromStr]) {
			addAmountToRange(currentRange, dateFromStr);
		}
		if ((daysCount % groupByCount === 0) || dateFrom.getTime() === dateTo.getTime()) {
			rangeKey = groupByCount === 1 ? currentRange.name : currentRange.name + ' - ' +
				dateFrom.toLocaleDateString(db.locale);
			rowData = [rangeKey];
			setupRowData(currentRange, rowData);
			chart.data.push(rowData);
			currentRange = null;
		}
		dateFrom.setUTCDate(dateFrom.getUTCDate() + 1);
	}

	return assign(result, chart);
};

var getFilesCompletedByStep = function (data) {
	var result = { handle: 'chart-files-completed-by-service' }, chart = {
		options: assign(copy(exports._commonOptions), {
			legend: { position: "top" },
			vAxis: { textPosition: "out" },
			chartArea: { width: "60%" }
		}),
		data: [["Service"]]
	};
	var services = getServiceNames(), noData = true;
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	Object.keys(data).forEach(function (shortPath) {
		var stepData = [getStepLabelByShortPath(shortPath)];
		Object.keys(services).forEach(function (serviceName) {
			if (!data[shortPath][serviceName]) {
				stepData.push(0);
			} else {
				if (data[shortPath][serviceName].processing.count) noData = false;
				stepData.push(data[shortPath][serviceName].processing.count);
			}
		});
		chart.data.push(stepData);
	});
	if (noData) {
		result.data = null;
		return result;
	}

	return assign(result, chart);
};

var getPendingFiles = function (data) {
	var result = { handle: 'chart-pending-files' }, chart = {
		options: assign(copy(exports._commonOptions), {
			colors: exports._stepsColors,
			pieSliceText: 'value-and-percentage',
			pieSliceTextStyle: { fontSize: '10' }
		}),
		drawMethod: 'PieChart',
		data: [["Role", "Count"]]
	}, noData = true;

	Object.keys(data).forEach(function (shortPath) {
		if (data[shortPath].startedCount) noData = false;
		chart.data.push([getStepLabelByShortPath(shortPath), data[shortPath].startedCount]);
	});
	if (noData) {
		result.data = null;
		return result;
	}

	return assign(result, chart);
};

var getAverageTime = function (data) {
	var result = { handle: 'chart-by-step-and-service' }, chart = {
		options: assign(copy(exports._commonOptions), {
			vAxis: { textPosition: "out" },
			chartArea: { width: "60%" },
			isStacked: false
		}),
		data: [["Role"]]
	}, noData = true;

	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	Object.keys(data).forEach(function (shortPath) {
		if (frontDeskNames.has(shortPath)) return;
		var stepData = [getStepLabelByShortPath(shortPath)];
		Object.keys(services).forEach(function (serviceName) {
			if (!data[shortPath][serviceName]) {
				stepData.push(0);
			} else {
				if (data[shortPath][serviceName].processing.avgTime) noData = false;
				stepData.push(Math.round(
					(data[shortPath][serviceName].processing.avgTime || 0) / 1000 / 60 / 60 / 24
				));
			}
		});
		chart.data.push(stepData);
	});

	if (noData) {
		result.data = null;
		return result;
	}

	return assign(result, chart);
};

var getAverageTimeByService = function (data) {
	var result = { handle: 'chart-by-service' }, chart = {
		options: assign(copy(exports._commonOptions), {
			vAxis: { textPosition: "out" },
			chartArea: { width: "60%" },
			legend: null
		}),
		data: [["Service", "Data", { role: "style" }]]
	}, noData = true;

	var services = getServiceNames(), i = 0;

	Object.keys(services).forEach(function (serviceName) {
		var row = [];
		row.push(services[serviceName].label);
		if (data[serviceName].processing.avgTime) noData = false;
		row.push(Math.round(
			(data[serviceName].processing.avgTime || 0) / 1000 / 60 / 60 / 24
		));
		row.push(chart.options.colors[i]);
		i++;
		chart.data.push(row);
	});

	if (noData) {
		result.data = null;
		return result;
	}

	return assign(result, chart);
};

var getWithdrawalTime = function (data) {
	var result = { handle: 'chart-withdrawal-time' }, chart = {
		options: assign(copy(exports._commonOptions), {
			isStacked: false,
			legend: null,
			vAxis: { textPosition: "out" },
			chartArea: { width: "60%" },
			axisTitlesPosition: "none"
		}),
		data: [["Service", "Data", { role: "style" }]]
	}, i = 0, noData = true;

	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		var row = [], frontDesk, frontDeskName, frontDeskData;
		frontDesk = db['BusinessProcess' +
			capitalize.call(serviceName)].prototype.processingSteps.frontDesk;
		if (!frontDesk) return;
		frontDeskName = frontDesk.key;
		frontDeskData = data[frontDeskName];
		if (!frontDeskData || !frontDeskData[serviceName]) return;
		row.push(services[serviceName].label);
		if (frontDeskData[serviceName].processing.avgTime) noData = false;
		row.push((Math.round(frontDeskData[serviceName].processing.avgTime || 0)
			/ 1000 / 60 / 60 / 24));
		row.push(chart.options.colors[i]);
		i++;
		chart.data.push(row);
	});

	if (noData) {
		result.data = null;
		return result;
	}

	return assign(result, chart);
};

var updateChartsData = function (data, query) {
	var dataForCharts = [], customChartsData = [];
	if (!data) return;

	dataForCharts.push(getFilesCompletedPerDay(data.dateRangeData.businessProcesses.byDateAndService,
		query));
	dataForCharts.push(getFilesCompletedByStep(data.dateRangeData.steps));
	dataForCharts.push(getPendingFiles(data.lastDateData));
	dataForCharts.push(getAverageTime(data.dateRangeData.steps));
	dataForCharts.push(getAverageTimeByService(data.dateRangeData.businessProcesses.byService));
	dataForCharts.push(getWithdrawalTime(data.dateRangeData.steps || {}));
	customChartsData = exports._customChartsGetData.call(this, data);
	if (customChartsData && customChartsData.length) {
		dataForCharts = dataForCharts.concat(customChartsData);
	}
	observableResult.value = dataForCharts;

	nextTick(function () {
		document.emit('statistics-chart-update');
	});
};

exports._parent = require('./user-base');

exports['dashboard-nav'] = { class: { 'submitted-menu-item-active': true } };

exports['sub-main'] = {
	class: { content: true },
	content: function () {
		var queryHandler, filesCompletedData = new ObservableValue();
		getStepLabelByShortPath = getStepLabelByShortPath(this.processingStepsMeta);

		queryHandler = setupQueryHandler(getQueryHandlerConf({
			processingStepsMeta: this.processingStepsMeta
		}), location, '/');

		queryHandler.on('query', function (query) {
			var serverQuery = copy(query);
			if (serverQuery.dateFrom) {
				serverQuery.dateFrom = serverQuery.dateFrom.toJSON();
			}
			if (serverQuery.dateTo) {
				serverQuery.dateTo = serverQuery.dateTo.toJSON();
			}
			queryServer(serverQuery).done(function (data) {
				updateChartsData(data.chartsResult, query);
				filesCompletedData.value = data.filesCompleted;
			});
		});

		section({ class: 'first-out-of-section-element date-period-selector-out-of-section-block' },
			form({ action: '/', autoSubmit: true },
				dateFromToBlock(),
				p({ class: 'submit' }, input({ type: 'submit' }))));

		getTimeBreakdownTable(filesCompletedData);

		section({ class: "section-primary" },
			h3(_("Files completed per time range")),
			div({ id: "chart-files-completed-per-day" }),
			p({ id: "chart-files-completed-per-day-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		section({ class: "section-primary" },
			h3(_("Processed files")),
			div({ id: "chart-files-completed-by-service" }),
			p({ id: "chart-files-completed-by-service-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		section({ class: "section-primary" }, h3(_("Pending files at ${ date }", {
			date: location.query.get('dateTo').map(function (dateTo) {
				var date = dateTo ? new db.Date(dateTo) : new db.Date();
				return date.toLocaleDateString(db.locale);
			})
		})),
			div({ id: "chart-pending-files" }),
			p({ id: "chart-pending-files-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		section({ class: "section-primary" },
			p({ class: 'entities-overview-info' },
				_("As processing time is properly recorded since 25th of October." +
					" Below table only exposes data for files submitted after that day.")),
			h3(_("Average processing time in days")),
			div({ id: "chart-by-step-and-service" }),
			p({ id: "chart-by-step-and-service-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		section({ class: "section-primary" },
			p({ class: 'entities-overview-info' },
				_("As processing time is properly recorded since 25th of October." +
					" Below table only exposes data for files submitted after that day.")),
			h3(_("Total average processing time per service in days")),
			div({ id: "chart-by-service" }),
			p({ id: "chart-by-service-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		section({ class: "section-primary" },
			p({ class: 'entities-overview-info' },
				_("As processing time is properly recorded since 25th of October." +
					" Below table only exposes data for files submitted after that day.")),
			h3(_("Withdrawal time in days")), div({ id: "chart-withdrawal-time" }),
			p({ id: "chart-withdrawal-time-message",
				class: "entities-overview-info" }, _("No data for this criteria")));
		exports._customChartsDOM.call(this);

		script(function () {
			google.charts.load('current', { packages: ['corechart'] });
		});
		script(function (chartsData) {
			var reloadCharts = function () {
				google.charts.setOnLoadCallback(function () {
					if (!chartsData) return;
					chartsData.forEach(function (chart) {
						if (!chart.data) {
							if ($(chart.handle).firstChild) {
								$(chart.handle).removeChild($(chart.handle).firstChild);
							}
							$(chart.handle + '-message').toggle(true);
							return;
						}
						$(chart.handle + '-message').toggle(false);
						var googleChart =
							new google.visualization[chart.drawMethod || 'BarChart']($(chart.handle));
						googleChart.draw(google.visualization.arrayToDataTable(chart.data), chart.options);
					});
				});
			};
			reloadCharts();
			// this will be invoked only in SPA
			if (document.on) document.on('statistics-chart-update', reloadCharts);
		}, observableResult);

		initTableSortingOnClient('.statistics-table-registrations');
	}
};
