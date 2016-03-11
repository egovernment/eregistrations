'use strict';

var domEnum = require('dbjs-dom/enum')
  , db      = require('mano').db
  , requirementUpload = db.RequirementUpload.prototype

  , user = db.User.prototype;

db.locale = 'en-GB';

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
if (db.StringLine && db.StringLine.DOMInput) {
	db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';
}

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
require('../../view/dbjs/submission-file');
require('../../view/dbjs/business-activity');
require('../view/dbjs/user-register-ids');
require('../view/dbjs/user-lomas-activity');
require('../view/dbjs/user-is-validated');
require('../view/dbjs/notification');
require('../view/dbjs/is-shopping-gallery');
require('../view/dbjs/company-info-shares');
require('../view/dbjs/partners-table');
require('../../view/dbjs/form-section-to-dom');
require('../../view/dbjs/form-section-group-to-dom');
require('../../view/dbjs/form-entities-table-to-dom');
require('../../view/dbjs/requirement-upload-to-dom-form');
require('../../view/dbjs/section-to-dom');
require('../../view/dbjs/section-group-to-dom');
require('../../view/dbjs/section-entities-table-to-dom');
require('../../view/dbjs/multiple');
require('../../view/dbjs/section-sides-to-dom');
require('../../view/dbjs/document-url');
require('../../view/dbjs/determinants-to-dom-fieldset')(
	db.BusinessProcessNew.prototype.determinants
);
require('../../view/dbjs/pickup-institution-form-section');

requirementUpload.$status.DOMInput = require('../../view/dbjs/_enum-inline-button-group');

domEnum(db.Role);
domEnum(db.CompanyType);
domEnum(db.NotificationType);
domEnum(db.StreetTypeChoice);
domEnum(db.RequirementUploadRejectReason);

user.$street.DOMInput = require('dbjs-dom/input/composites/line');
user.$isDebtContinusStatus.DOMInput =
	require('../../view/dbjs/continuity-btn-group');
