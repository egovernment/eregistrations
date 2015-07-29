// Index for BusinessProcess model
'use strict';

var memoize = require('memoizee/plain');

module.exports = memoize(function (db/*, opts */) {
	var BusinessProcess, opts;
	opts = Object(arguments[1]);
	BusinessProcess = require('./base')(db, opts);
	require('./certificates')(db, opts);
	require('./costs')(db, opts);
	require('./data-forms')(db, opts);
	require('./derived')(db, opts);
	require('./documents')(db, opts);
	require('./flow')(db, opts);
	require('./guide')(db, opts);
	require('./processing-steps')(db, opts);
	require('./registrations')(db, opts);
	require('./requirement-uploads')(db, opts);
	require('./requirements')(db, opts);
	require('./submission-forms')(db, opts);
	require('./representative')(db, opts);

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
