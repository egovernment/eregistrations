'use strict';

var Database = require('dbjs')
  , defineProgressRule = require('../../../model/lib/progress-rule');

module.exports = function (t, a) {
	var db = new Database()
	  , ProgressRules = t(db)
	  , ProgressRule  = defineProgressRule(db)

	  , progressRules = new ProgressRules()
	  , warning1, warning2;

	warning1 = "Rule 1 violated!";
	warning2 = "Rule 2 violated!";
	progressRules.map.define('rule1', {
		type: ProgressRule,
		nested: true
	});

	progressRules.map.get('rule1').setProperties({
		progress: 1,
		weight: 1,
		message: warning1
	});

	progressRules.map.define('rule2', {
		type: ProgressRule,
		nested: true
	});

	progressRules.map.get('rule2').setProperties({
		progress: 0.5,
		weight: 2,
		message: warning2
	});

	a(progressRules.weight, 3);
	a(progressRules.applicable.size, 2);
	a(progressRules.invalid.size, 1);
	a(progressRules.progress, 0.66);
	a(progressRules.invalid.first.message, warning2);
	progressRules.applicable.first.progress = 0.5;
	a(progressRules.invalid.first.message, warning1);
	a(progressRules.invalid.last.message, warning2);
};
