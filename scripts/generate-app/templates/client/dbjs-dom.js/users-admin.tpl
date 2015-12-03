// DOM bindings for DBJS model

'use strict';

var db = require('./model.generated');

require('dbjs-dom/text')(db);
require('dbjs-dom/text/utils/table')(db);
require('dbjs-dom/ext/domjs/table-cell-render');
require('dbjs-dom/input')(db);
require('eregistrations/view/dbjs/multiple');
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/string/string-line/password')(db);
require('dbjs-dom/input/utils/fieldset')(db);
require('dbjs-dom/input/enum')(db.Role);
