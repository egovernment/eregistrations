// Official form view

'use strict';

exports._parent = require('./business-process-revision');

exports['tab-business-process-processing'] = { class: { active: true } };
exports['tab-content'] = function () { exports._officialForm(this); };

exports._officialForm = Function.prototype;
