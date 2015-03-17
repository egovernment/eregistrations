'use strict';

var Map = require('es6-map')
  , db  = require('mano').db

  , StringLine = require('dbjs-ext/string/string-line')(db);

require('dbjs-ext/create-enum')(db);

module.exports = StringLine.createEnum('SeHContinuityStatus', new Map([
	["no", {
		label: "Lorem ipsum dolor sit amet, consectetur",
		order: 1
	}],
	["paused", {
		label: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
		order: 2
	}],
	["yes", {
		label: "Lorem ipsum dolor sit amet,",
		order: 3
	}]
]));
