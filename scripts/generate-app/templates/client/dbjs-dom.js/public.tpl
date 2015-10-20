// Database DOM bindings

'use strict';

var d  = require('d')
  , _  = require('mano').i18n.bind("Public")
  , db = require('mano').db;

db.locale = 'es-SV';
Object.defineProperty(db.Base, 'chooseLabel', d(_("Choose:")));
Object.defineProperties(db.Boolean, {
	trueLabel: d(_("Yes")),
	falseLabel: d(_("No"))
});

require('dbjs-dom/text')(db);
require('dbjs-dom/input')(db);
require('dbjs-dom/input/string/string-line')(db);
require('dbjs-dom/input/string/string-line/email')(db);
require('dbjs-dom/input/string/string-line/password')(db);
