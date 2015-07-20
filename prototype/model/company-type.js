'use strict';

var db         = require('mano').db
  , StringLine = require('dbjs-ext/string/string-line')(db)
  , Map        = require('es6-map');

module.exports = StringLine.createEnum('CompanyType', new Map([
	['private', { label: "Private limited company" }],
	['public', { label: "Public company" }]
]));
