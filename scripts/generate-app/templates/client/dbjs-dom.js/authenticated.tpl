// dbjs-dom setup
'use strict';

var db = require('./model.generated');

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/date-time/date')(db);
require('dbjs-dom/input/string/string-line/password')(db);
require('dbjs-dom/input/object/file')(db);
require('dbjs-dom/input/utils/fieldset')(db);

db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';
