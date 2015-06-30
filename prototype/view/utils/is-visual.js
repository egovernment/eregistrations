// Are we in visual interface (or maybe it's just programmatical document generator)

'use strict';

module.exports = (function () {
	if ((typeof window !== 'object') || !window) return false;
	if ((typeof document !== 'object') || !document) return false;
	if (typeof window.getComputedStyle !== 'function') return false;
	return Boolean(window.getComputedStyle(document.documentElement).color);
}());
