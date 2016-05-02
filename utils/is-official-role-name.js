// Returns true if provided role name is for one of the processing officials

'use strict';

module.exports = RegExp.prototype.test.bind(/^official[A-Z]/);
