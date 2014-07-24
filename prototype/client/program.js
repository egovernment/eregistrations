'use strict';

require('mano/lib/client')({
	noData: true,
	schema: function () {
		var db      = require('./model.generated')
		  , domEnum = require('dbjs-dom/enum');

		require('dbjs-dom/text')(db);
		require('dbjs-dom/input')(db);
		require('dbjs-dom/text/utils/table')(db);
		require('dbjs-dom/ext/domjs/table-cell-render');

		require('dbjs-dom/input/date-time/date')(db);
		require('dbjs-dom/input/string/string-line')(db);
		require('dbjs-dom/input/string/string-line/email')(db);
		require('dbjs-dom/input/string/string-line/password')(db);

		require('dbjs-dom/input/utils/fieldset')(db);
		require('dbjs-dom-bootstrap/number/currency')(db);
		require('dbjs-dom-bootstrap/number/square-meters')(db);
		require('../../view/dbjs/business-activity');

		domEnum(db.CompanyType);
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
