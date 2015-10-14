'use strict';

var runCi = require('../utils/run-ci-process');

runCi('npm', ['test']);
runCi('npm', ['run', 'lint-ci']);
runCi('npm', ['run', 'css-lint-ci']);
