// dbjs-dom setup.

'use strict';

var db = require('./model.generated');

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/string/string-line/password')(db);
require('dbjs-dom/input/date-time/date')(db);
require('dbjs-dom/input/object/file')(db);
require('dbjs-dom/input/utils/fieldset')(db);
require('dbjs-dom-bootstrap/number/currency')(db);
require('eregistrations/view/dbjs/multiple');
require('eregistrations/view/dbjs/submission-file');
require('eregistrations/view/dbjs/document-url');

require('dbjs-dom/text/utils/table')(db);
require('dbjs-dom/ext/domjs/table-cell-render');

db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';

require('eregistrations/view/dbjs/section-to-dom');
require('eregistrations/view/dbjs/section-entities-table-to-dom');
require('eregistrations/view/dbjs/section-group-to-dom');
require('eregistrations/view/dbjs/form-section-to-dom');
