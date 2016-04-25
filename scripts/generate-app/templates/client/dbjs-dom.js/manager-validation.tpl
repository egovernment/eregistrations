// DOM bindings for DBJS model

'use strict';

var db               = require('mano').db
  , isReadOnlyRender = require('mano/client/utils/is-read-only-render')
  , d                = require('d')
  , domEnum          = require('dbjs-dom/enum');

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

Object.defineProperty(
	db.User.prototype.getDescriptor('isManagerActive'),
	'DOMInput',
	d(require('eregistrations/view/dbjs/boolean-inline-button-group'))
);

db.StringLine.DOMInput.prototype.dbAttributes.inputMask = 'data-mask';

if (!isReadOnlyRender) require('dbjs-file/client')(db, FormData, XMLHttpRequest, File, '/upload/');
