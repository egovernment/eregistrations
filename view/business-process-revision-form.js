// Official form view

'use strict';

exports._parent = require('./business-process-revision');

exports['business-process-processing'] = { class: { active: true } };
exports['official-revision-content'] = function () { exports._officialForm(this); };

exports._officialForm = Function.prototype;
