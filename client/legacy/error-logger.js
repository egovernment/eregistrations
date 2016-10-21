'use strict';

var onError = function (message, source, line, column, error) {
	var xhr = new XMLHttpRequest(), isSent = false, queryConfig;
	xhr.open('POST', '/log-client-error/', true);
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	if ((typeof sessionStorage !== 'undefined') && sessionStorage.manoSessionId) {
		xhr.setRequestHeader("X-Browser-Session", sessionStorage.manoSessionId);
	}
	xhr.onreadystatechange = function () {
		var status;
		if (isSent) return;
		if (xhr.readyState !== 4) return;
		try {
			status = xhr.status;
		} catch (e) {
			// Old IE happens to crash on status access in some scenarios, ignore it
			return;
		}
		isSent = true;
		if ((typeof console === 'undefined') || !console || !console.log) return;
		if (status === 200) {
			console.log("Successfully sent client crash log");
		} else {
			console[console.error ? 'error' : 'log']("Failed to send client crash log");
		}
	};
	queryConfig = {
		location: location.href,
		message: message,
		source: source,
		line: line,
		column: column,
		errorMessage: error && error.message,
		errorStack: error && error.stack
	};

	xhr.send('data=' + JSON.stringify(queryConfig));
};

(function () {
	if ((typeof XMLHttpRequest === 'undefined') || (typeof JSON === 'undefined')) return;
	if (window.attachEvent) {
		// We favor attachEvent before addEventListener
		// As in IE implementations which supports both event that's provided to addEventListener
		// brings zero information about an error
		window.attachEvent('onerror', onError);
	} else if (window.addEventListener) {
		window.addEventListener('error', function (event) {
			onError(event.message, event.source, event.lineno, event.colno, event.error);
		});
	} else {
		window.onerror = onError;
	}
}());
