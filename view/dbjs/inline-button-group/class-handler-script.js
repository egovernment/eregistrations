'use strict';

module.exports = function (id, classMap) {
	var current, radio, radios;
	var onChange = function () {
		var nu, i;
		for (i = 0; (radio = radios[i]); ++i) {
			if (radio.checked) {
				nu = radio;
				break;
			}
		}
		if (nu === current) return;
		if (current) current.parentNode.removeClass((classMap && classMap[current.value]) || 'success');
		if (nu) $(nu.parentNode).addClass((classMap && classMap[nu.value]) || 'success');
		current = nu;
	};
	setTimeout(function self() {
		var container = $(id);
		if (!container) {
			setTimeout(self, 1000);
			return;
		}
		radios = container.getElementsByTagName('input');
		container.addEvent('change', function () { setTimeout(onChange, 0); });
		container.addEvent('click', function () { setTimeout(onChange, 0); });
		onChange();
	}, 0);
};
