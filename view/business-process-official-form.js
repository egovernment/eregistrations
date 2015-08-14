// Official form view

'use strict';

exports._parent = require('./business-process-official');

exports['business-process-official-form'] = { class: { active: true } };
exports['business-process-official-content'] = function () { exports._officialForm(this); };

exports._officialForm = Function.prototype;
