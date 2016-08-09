'use strict';

var Database = require('dbjs')
  , defineBusinessProcess = require('../../model/business-process-new/processing-steps');

module.exports = function (t, a) {
	var db = new Database()
	  , BusinessProcess = defineBusinessProcess(db)
	  , businessProcess, fooStep, barStep, miszkaStep;

	BusinessProcess.prototype.processingSteps.map.defineProperties({
		foo: { nested: true },
		bar: { nested: true },
		miszka: { nested: true }
	});
	BusinessProcess.prototype.processingSteps.map.bar.defineProperties({
		previousSteps: { value: function () { return [this.owner.foo]; } }
	});
	BusinessProcess.prototype.processingSteps.map.miszka.defineProperties({
		previousSteps: { value: function () { return [this.owner.bar]; } }
	});
	businessProcess = new BusinessProcess();
	fooStep = businessProcess.processingSteps.map.foo;
	barStep = businessProcess.processingSteps.map.bar;
	miszkaStep = businessProcess.processingSteps.map.miszka;

	businessProcess.set('isAtDraft', false);
	businessProcess.set('isSubmitted', true);
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, false);
	a(miszkaStep.isPreviousStepsSatisfied, false);

	a(fooStep.isApplicable, true);
	a(fooStep.isClosed, false);
	a(fooStep.isSatisfiedReady, false);

	fooStep.isRejected = true;
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, false);
	a(miszkaStep.isPreviousStepsSatisfied, false);
	a(fooStep.isClosed, true);

	fooStep.isRejected = false;
	a(fooStep.isClosed, false);

	fooStep.isApproved = true;
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, false);
	a(miszkaStep.isPreviousStepsSatisfied, false);
	a(fooStep.isSatisfiedReady, true);
	a(fooStep.isClosed, true);
	fooStep.isApplicable = false;
	a(fooStep.isSatisfiedReady, true);

	fooStep.isSatisfied = true;
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, true);
	a(miszkaStep.isPreviousStepsSatisfied, false);

	barStep.isSatisfied = true;
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, true);
	a(miszkaStep.isPreviousStepsSatisfied, true);

	businessProcess.set('isAtDraft', true);
	a(fooStep.isPreviousStepsSatisfied, false);
	a(barStep.isPreviousStepsSatisfied, false);
	a(miszkaStep.isPreviousStepsSatisfied, false);

	businessProcess.set('isAtDraft', false);
	a(fooStep.isPreviousStepsSatisfied, true);
	a(barStep.isPreviousStepsSatisfied, true);
	a(miszkaStep.isPreviousStepsSatisfied, true);
};
