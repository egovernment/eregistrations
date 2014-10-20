'use strict';

require('mano/lib/client')({
	noData: true,
	schema: function () {
		var db      = require('./model.generated')
		  , domEnum = require('dbjs-dom/enum')
		  , user = db.User.prototype;

		require('dbjs-dom/text')(db);
		require('dbjs-dom/input')(db);
		require('dbjs-dom/text/utils/table')(db);
		require('dbjs-dom/ext/domjs/table-cell-render');

		require('dbjs-dom/input/date-time/date')(db);
		require('dbjs-dom/input/object/file')(db);
		require('dbjs-dom/input/string/string-line')(db);
		require('dbjs-dom/input/string/string-line/email')(db);
		require('dbjs-dom/input/string/string-line/password')(db);

		require('dbjs-dom/input/utils/fieldset')(db);
		require('dbjs-dom-bootstrap/number/currency')(db);
		require('dbjs-dom-bootstrap/number/square-meters')(db);
		require('eregistrations/view/dbjs/submission-file');
		require('../../view/dbjs/business-activity');
		require('../../view/dbjs/user-register-ids');
		require('../../view/dbjs/notification');
		require('../../view/dbjs/is-shopping-gallery');
		require('../../view/dbjs/partners-table');
		require('../../view/dbjs/form-section-to-dom');
		require('../../view/dbjs/form-section-group-to-dom');
		require('../../view/dbjs/form-entities-table-to-dom');
		require('../../view/dbjs/section-to-dom');
		require('../../view/dbjs/section-group-to-dom');
		require('../../view/dbjs/section-entities-table-to-dom');

		domEnum(db.Role);
		domEnum(db.CompanyType);
		domEnum(db.NotificationType);
		domEnum(db.StreetTypeChoice);

		user.$street.DOMInput = require('dbjs-dom/input/composites/line');
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
