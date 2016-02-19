// DOM bindings for DBJS model

'use strict';

var db = require('./model.generated');

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/string/string-line/password')(db);
