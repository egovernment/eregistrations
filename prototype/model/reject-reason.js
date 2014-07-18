'use strict';

var Map = require('es6-map')
  , db  = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db);

require('dbjs-ext/create-enum')(db);

module.exports = StringLine.createEnum('RejectReason', new Map([
	["illegible", {
		label: "Unrecognized"
	}],
	["invalid", {
		label: "Invalid"
	}],
	["other", {
		label: "Other…"
	}]
]));
