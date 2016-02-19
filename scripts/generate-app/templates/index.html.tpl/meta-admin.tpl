<!DOCTYPE html>
<html>
	<meta name="viewport" content="width=device-width" />
	<noscript><meta http-equiv="refresh" content="0;/?legacy=1" /></noscript>
	<script data-spa>
if (!Object.getPrototypeOf || !Object.defineProperty || !window.history ||
		(function () {'use strict'; return this; }()) ||
	 (Object.getPrototypeOf({ __proto__: Function.prototype }) !==
		 Function.prototype) || (Object.defineProperty({}, 'foo',
			 { get: function () { return 'bar'; } }).foo !== 'bar')) {
	if (document.cookie.indexOf('legacy=') === -1) {
		document.cookie = 'legacy=1;path=/';
		location.reload();
	} else {
		document.write('<p>Your browser is not supported</p>');
	}
} else {
	document.write('<link href="${ stRoot }meta-admin.css" rel="stylesheet" />');
	document.write('<scr' + 'ipt src="${ stRoot }meta-admin.legacy.js"></sc' + 'ript>');
	document.write('<scr' + 'ipt data-spa src="/i18n.js"></sc' + 'ript>');
	document.write('<scr' + 'ipt data-spa src="${ stRoot }meta-admin.js"></sc' + 'ript>');
}
	</script>
