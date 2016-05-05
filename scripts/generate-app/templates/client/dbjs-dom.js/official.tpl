// DOM bindings for DBJS model

'use strict';

var isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , db               = require('./model.generated');

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/date-time/date')(db);
require('dbjs-dom/input/string/string-line/password')(db);
require('dbjs-dom/input/object/file')(db);
require('dbjs-dom/input/utils/fieldset')(db);
require('eregistrations/view/dbjs/submission-file');

db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';

if (!isReadOnlyRender) require('dbjs-file/client')(db, FormData, XMLHttpRequest, File, '/upload/');
