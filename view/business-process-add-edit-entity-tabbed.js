// Generic entity form user page (Part A)

'use strict';

var step = require('./business-process-add-edit-entity').step;

exports._parent = require('./business-process-data-forms-tabbed');
exports._match = 'entity';

exports['forms-sections-content'] = step;
