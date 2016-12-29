'user strict';

var dateRange = function (options) {
	if (!(this instanceof dateRange)) return new dateRange(options);
	this.element = options.element;
	setTimeout(this.init.bind(this), 0);
}

module.exports = dateRange;

dateRange.prototype.init = function () {
	this.setupMenu();
}

dateRange.prototype.setupMenu = function () {
	this.pressets = document.createElement('ul');
	this.pressets.classList.add('data-range-presets');
	this.element.appendChild(this.presets);
}
