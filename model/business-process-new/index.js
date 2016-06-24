// Index for BusinessProcess model
'use strict';

var memoize = require('memoizee/plain');

module.exports = memoize(function (db/*, options */) {
	var options         = Object(arguments[1])
	  , BusinessProcess = require('./base')(db, options);

	require('./certificates')(db, options);
	require('./costs')(db, options);
	require('./data-forms')(db, options);
	require('./derived')(db, options);
	require('./flow')(db, options);
	require('./guide')(db, options);
	require('./manager')(db, options);
	require('./processing-steps')(db, options);
	require('./registrations')(db, options);
	require('./requirement-uploads')(db, options);
	require('./requirements')(db, options);
	require('./submission-forms')(db, options);
	require('./representative')(db, options);

	return BusinessProcess;
}, { normalizer: require('memoizee/normalizers/get-1')() });
