#!/usr/bin/env node

// Generates mock for legacy

'use strict';

Error.stackTraceLimit = Infinity;

require('../scripts/generate-${ appNameHyphenedSuffix }-legacy-dbjs-mock')().done();
