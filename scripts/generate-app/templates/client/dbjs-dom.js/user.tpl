// Database DOM bindings

'use strict';

var db      = require('./model.generated')
  , domEnum = require('dbjs-dom/enum');

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/string/string-line/password')(db);
require('dbjs-dom/input/date-time/date')(db);
require('dbjs-dom/input/object/file')(db);
require('dbjs-dom/input/utils/fieldset')(db);
require('eregistrations/view/dbjs/multiple');
require('eregistrations/view/dbjs/submission-file');
require('eregistrations/view/dbjs/document-url');
require('eregistrations/model/lib/data-snapshot/resolved')(db);

require('dbjs-dom/text/utils/table')(db);
require('dbjs-dom/ext/domjs/table-cell-render');

domEnum(db.BusinessProcessStatus);

db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';
