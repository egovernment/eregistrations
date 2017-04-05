<!DOCTYPE html>
<html>
    <meta name="viewport" content="width=device-width" />
    <noscript><meta http-equiv="refresh" content="0;/?legacy=1" /></noscript>
    <script data-spa>
if (!Object.getPrototypeOf || !Object.defineProperty || !window.history || !window.localStorage ||
        !(function () { try { localStorage.$test = ''; return true; } catch (ignore) {} }()) ||
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
    document.write('<scr' + 'ipt data-spa crossorigin defer src="js/jquery.min.js"></sc' + 'ript>');
    document.write('<scr' + 'ipt data-spa crossorigin defer src="js/jquery-ui.min.js"></sc' + 'ript>');
    document.write('<scr' + 'ipt data-spa crossorigin defer src="js/moment.min.js"></sc' + 'ript>');
    document.write('<scr' + 'ipt data-spa crossorigin defer src="js/jquery.comiseo.daterangepicker.js"></sc' + 'ript>');

    document.write('<link href="${ stRoot }${ appName }.css" rel="stylesheet" />');
    document.write('<scr' + 'ipt crossorigin defer src="${ stRoot }${ appName }.legacy.js"></sc' + 'ript>');
    document.write('<scr' + 'ipt data-spa crossorigin defer src="${ stRoot }${ appName }.js"></sc' + 'ript>');
}
    </script>

