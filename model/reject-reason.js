'use strict';

var Map = require('es6-map')
  , db  = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db)
  , _ = require('mano').i18n.bind('Model: User');

require('dbjs-ext/create-enum')(db);

module.exports = StringLine.createEnum('RejectReason', new Map([
	["illegible", {
		label: _("The document is unreadable")
	}],
	["invalid", {
		label: _("The loaded document does not match the required document")
	}],
	["other", {
		label: _("Other") + "..."
	}]
]));
