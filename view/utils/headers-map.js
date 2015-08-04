'use strict';

var ns = require('mano').domjs.ns, result, i = 7;
// We ensure handling of all html header tags
result = { 1: ns.h1, 2: ns.h2, 3: ns.h3, 4: ns.h4, 5: ns.h5, 6: ns.h6 };
// We ensure handling of keys greater than 6 up to 20
for (i = 7; i < 21; i++) {
	result[i] = ns.h6;
}

module.exports = result;
