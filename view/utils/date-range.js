'user strict';

var _ = require('mano').i18n.bind('View: all');

var dateRange = function (options) {
	if (!(this instanceof dateRange)) return new dateRange(options);
	this.element = options.element;
	setTimeout(this.init.bind(this), 0);
}

module.exports = dateRange;

dateRange.prototype.init = function () {
	this.toggler = document.getElementById('date-range-toggler');
	this.toggler.addEventListener('click', this.bindMethod('toggleDates'));
	this.setupMenu();
}

dateRange.prototype.bindMethod = function (name) {
	return this['_' + name + '_'] || Object.defineProperty(
		this,
		'_' + name + '_',
		{ value: this[name].bind(this) }
	)['_' + name + '_'];
};

dateRange.prototype.today = function () {
	this.presetToday = document.createElement('li');
	this.presetTodayButton = document.createElement('button');
	this.presetTodayButton.textContent = _("Today");
	this.presetToday.appendChild(this.presetTodayButton);
	return this.presetToday;
}

dateRange.prototype.thisWeek = function () {
	this.presetThisWeek = document.createElement('li');
	this.presetThisWeekButton = document.createElement('button');
	this.presetThisWeekButton.textContent = _("This week");
	this.presetThisWeek.appendChild(this.presetThisWeekButton);
	return this.presetThisWeek;
}

dateRange.prototype.thisMonth = function () {
	this.presetThisMonth = document.createElement('li');
	this.presetThisMonthButton = document.createElement('button');
	this.presetThisMonthButton.textContent = _("This month");
	this.presetThisMonth.appendChild(this.presetThisMonthButton);
	return this.presetThisMonth;
}

dateRange.prototype.lastMonth = function () {
	this.presetLastMonth = document.createElement('li');
	this.presetLastMonthButton = document.createElement('button');
	this.presetLastMonthButton.textContent = _("Last month");
	this.presetLastMonth.appendChild(this.presetLastMonthButton);
	return this.presetLastMonth;
}

dateRange.prototype.thisYear = function () {
	this.presetThisYear = document.createElement('li');
	this.presetThisYearButton = document.createElement('button');
	this.presetThisYearButton.textContent = _("This year");
	this.presetThisYear.appendChild(this.presetThisYearButton);
	return this.presetThisYear;
}

dateRange.prototype.actionButtons = function () {
	this.presetActionButtons = document.createElement('li');
	this.presetActionButtons.classList.add("date-range-actions")
	this.presetValidate = document.createElement('button');
	this.presetValidate.classList.add("button-main");
	this.presetValidate.classList.add("button-main-success");
	this.presetValidate.textContent = _("Validate");
	this.presetCancel = document.createElement('button');
	this.presetCancel.textContent = _("Cancel");
	this.presetCancel.addEventListener('click', this.bindMethod('toggleDates'));
	this.presetActionButtons.appendChild(this.presetValidate);
	this.presetActionButtons.appendChild(this.presetCancel);
	return this.presetActionButtons;
}

dateRange.prototype.setupMenu = function () {
	this.presets = document.createElement('ul');
	this.presets.classList.add('date-range-presets');
	
	this.presets.appendChild(this.today());
	this.presets.appendChild(this.thisWeek());
	this.presets.appendChild(this.thisMonth());
	this.presets.appendChild(this.lastMonth());
	this.presets.appendChild(this.thisYear());
	this.presets.appendChild(this.actionButtons());
	this.element.appendChild(this.presets);
}

dateRange.prototype.toggleDates = function () {
	this.presets.classList.toggle('active');
};
