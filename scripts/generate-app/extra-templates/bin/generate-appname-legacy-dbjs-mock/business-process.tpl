#!/usr/bin/env node

// Generates mock for legacy

'use strict';

Error.stackTraceLimit = Infinity;

require('../scripts/generate-${ appName }-legacy-dbjs-mock')().done();
