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
  , getQueryHandlerConf = require('../routes/utils/get-statistics-time-query-handler-conf')

  , observableResult = new ObservableValue();

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
	is3D: true,
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

var getFilesCompletedPerDay = function (data) {
	var result = { handle: 'chart-files-completed-per-day' }, chart = {
		options: assign(copy(exports._commonOptions), {
			orientation: 'horizontal'
		}),
		data: [["Service"]]
	}, days = Object.keys(data.filesApprovedByDay),
		dateFrom, dateTo, dateFromStr, rowData, rangeKey, groupByCount,
		daysCount = 0, currentRange,
		setupRange, addAmountToRange, setupRowData;

	if (!days || !days.length) {
		result.data = null;
		return result;
	}
	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	dateFrom = new Date(Date.parse(data.filesApprovedByDay.dateFrom));
	dateTo   = new Date(Date.parse(data.filesApprovedByDay.dateTo));
	groupByCount = getGroupByCount(dateFrom, dateTo);

	setupRange = function (currentRange) {
		Object.keys(services).forEach(function (serviceName) {
			currentRange.services[serviceName] = 0;
		});
	};

	addAmountToRange = function (currentRange, dateFromStr) {
		Object.keys(services).forEach(function (serviceName) {
			var amount;
			amount = data.filesApprovedByDay[dateFromStr][serviceName] || 0;
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
		if (data.filesApprovedByDay[dateFromStr]) {
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
		options: exports._commonOptions,
		data: [["Service"]]
	};
	if (!Object.keys(data.byStepAndService).length) {
		return result;
	}

	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	Object.keys(data.byStepAndService).forEach(function (shortPath) {
		var stepData = [getStepLabelByShortPath(shortPath)];
		Object.keys(services).forEach(function (serviceName) {
			if (!data.byStepAndService[shortPath][serviceName]) {
				stepData.push(0);
				return;
			}
			stepData.push(data.byStepAndService[shortPath][serviceName].processed);
		});
		chart.data.push(stepData);
	});

	return assign(result, chart);
};

var getPendingFiles = function (data) {
	var result = { handle: 'chart-pending-files' }, chart = {
		options: assign(copy(exports._commonOptions), {
			colors: exports._stepsColors
		}),
		drawMethod: 'PieChart',
		data: [["Role", "Count"]]
	};

	if (!data.pendingFiles || !Object.keys(data.pendingFiles).length) {
		return result;
	}

	Object.keys(data.pendingFiles).forEach(function (shortPath) {
		chart.data.push([getStepLabelByShortPath(shortPath), data.pendingFiles[shortPath] || 0]);
	});

	return assign(result, chart);
};

var getAverageTime = function (data) {
	var result = { handle: 'chart-by-step-and-service' }, chart = {
		options: assign(copy(exports._commonOptions), {
			isStacked: false
		}),
		data: [["Role"]]
	};

	if (!data.byStepAndService || !Object.keys(data.byStepAndService).length) {
		return result;
	}
	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		chart.data[0].push(services[serviceName].label);
	});
	Object.keys(data.byStepAndService).forEach(function (shortPath) {
		if (shortPath === 'frontDesk') return;
		var stepData = [getStepLabelByShortPath(shortPath)];
		Object.keys(services).forEach(function (serviceName) {
			if (!data.byStepAndService[shortPath][serviceName]) {
				stepData.push(0);
				return;
			}
			stepData.push(
				Math.round(data.byStepAndService[shortPath][serviceName].avgTime / 1000 / 60 / 60 / 24)
			);
		});
		chart.data.push(stepData);
	});

	return assign(result, chart);
};

var getAverageTimeByService = function (data) {
	var result = { handle: 'chart-by-service' }, chart = {
		options: assign(copy(exports._commonOptions), {
			legend: null
		}),
		data: [["Service", "Data", { role: "style" }]]
	};

	if (!data.byService || !Object.keys(data.byService).length) {
		return result;
	}

	var services = getServiceNames(), i = 0;

	Object.keys(services).forEach(function (serviceName) {
		var row = [];
		row.push(services[serviceName].label);
		row.push(Math.round(
			(data.byService[serviceName] ? data.byService[serviceName].avgTime : 0) / 1000 / 60 / 60 / 24
		));
		row.push(chart.options.colors[i]);
		i++;
		chart.data.push(row);
	});

	return assign(result, chart);
};

var getWithdrawalTime = function (data) {
	var result = { handle: 'chart-withdrawal-time' }, chart = {
		options: assign(copy(exports._commonOptions), {
			isStacked: false,
			legend: null,
			axisTitlesPosition: "none"
		}),
		data: [["Service", "Data", { role: "style" }]]
	}, i = 0;

	if (!data.byStepAndService.frontDesk) {
		return result;
	}
	var services = getServiceNames();
	Object.keys(services).forEach(function (serviceName) {
		var row = [];
		row.push(services[serviceName].label);
		if (!data.byStepAndService.frontDesk[serviceName]) {
			row.push(0);
		} else {
			row.push(
				Math.round(data.byStepAndService.frontDesk[serviceName].avgTime / 1000 / 60 / 60 / 24)
			);
		}
		row.push(chart.options.colors[i]);
		i++;
		chart.data.push(row);
	});

	return assign(result, chart);
};

var updateChartsData = function (data) {
	var dataForCharts = [], customChartsData = [];
	if (!data) return;

	dataForCharts.push(getFilesCompletedPerDay(data));
	dataForCharts.push(getFilesCompletedByStep(data));
	dataForCharts.push(getPendingFiles(data));
	dataForCharts.push(getAverageTime(data));
	dataForCharts.push(getAverageTimeByService(data));
	dataForCharts.push(getWithdrawalTime(data));
	customChartsData = exports._customChartsGetData.call(this, data);
	if (customChartsData && customChartsData.length) {
		dataForCharts = dataForCharts.concat(customChartsData);
	}
	observableResult.value = dataForCharts;

	nextTick(function () {
		document.emit('statistics-chart-update');
	});
};

exports._parent = require('./statistics-base');

exports['dashboard-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
	var queryHandler;
	getStepLabelByShortPath = getStepLabelByShortPath(this.processingStepsMeta);

	queryHandler = setupQueryHandler(getQueryHandlerConf({
		db: db,
		processingStepsMeta: this.processingStepsMeta,
		queryConf: null
	}), location, '/');

	queryHandler.on('query', function (query) {
		if (query.dateFrom) {
			query.dateFrom = query.dateFrom.toJSON();
		}
		if (query.dateTo) {
			query.dateTo = query.dateTo.toJSON();
		}
		queryServer(query).done(function (result) {
			updateChartsData(result);
		});
	});

	section({ class: 'section-primary users-table-filter-bar' },
		form({ action: '/', autoSubmit: true },
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-from-input' }, _("Date from"), ":"),
				input({ id: 'date-from-input', type: 'date',
					name: 'dateFrom', value: location.query.get('dateFrom') })
			),
			div(
				{ class: 'users-table-filter-bar-status' },
				label({ for: 'date-to-input' }, _("Date to"), ":"),
				input({ id: 'date-to-input', type: 'date',
					name: 'dateTo', value: location.query.get('dateTo') })
			),
			p({ class: 'submit' }, input({ type: 'submit' }))));

	section({ class: "section-primary" },
		h3(_("Files completed per time range")),
		div({ id: "chart-files-completed-per-day" }));
	section({ class: "section-primary" },
		h3(_("Processed files")),
		div({ id: "chart-files-completed-by-service" }));
	section({ class: "section-primary" }, h3(_("Pending files at ${ date }", {
		date: location.query.get('dateTo').map(function (dateTo) {
			var date = dateTo ? new db.Date(dateTo) : new db.Date();
			return date.toLocaleDateString(db.locale);
		})
	})),
		div({ id: "chart-pending-files" }));
	section({ class: "section-primary" },
		h3(_("Average processing time in days")),
		div({ id: "chart-by-step-and-service" }));
	section({ class: "section-primary" },
		h3(_("Total average processing time per service in days")),
		div({ id: "chart-by-service" }));
	section({ class: "section-primary" },
		h3(_("Withdrawal time in days")), div({ id: "chart-withdrawal-time" }));
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
						$(chart.handle).innerHtml = '';
						return;
					}
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
};
