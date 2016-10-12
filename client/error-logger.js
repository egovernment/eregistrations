'use strict';

var xhr = require('mano/lib/client/xhr-driver');

window.onerror = function (message, source, lineno, colno, error) {
	xhr.post('/log-client-error/', { message: message, error: error.toString(), stack: error.stack });
};
