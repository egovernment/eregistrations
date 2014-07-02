'use strict';

require('mano/lib/client')({
	noData: true,
	schema: function () {
		var db = require('./model.generated');

		require('dbjs-dom/text')(db);
		require('dbjs-dom/input')(db);
		require('dbjs-dom/input/string/string-line')(db);
		require('dbjs-dom/input/string/string-line/email')(db);
		require('dbjs-dom/input/string/string-line/password')(db);
	},
	viewRequire: require('../../view/prototype/_require'),
	routes: function (router, view) {
		var mano = require('mano');
		mano.env = require('../../common/client/env');
		router.get = require('../../view/prototype/_routes')(view);
		router.post = require('mano/lib/client/build-controller')(
			require('../controller'),
			require('./controller')
		);
	}
});
