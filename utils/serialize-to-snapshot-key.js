'use strict';

var stringify = JSON.stringify;

module.exports = function (tokens) { return stringify(tokens).slice(1, -1); };
