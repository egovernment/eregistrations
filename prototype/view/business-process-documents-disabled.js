'use strict';

exports._parent = require('./business-process-documents');

exports['step-documents'] = { class: { 'step-active': true } };

exports['documents-disabler-range'] = { class: { 'disabler-active': true } };
