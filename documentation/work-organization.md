# Work organization

## Iterations/Milestones

Tasks are grouped into short (usually 1-2 week) iterations, which are marked with milestone which is named with version number (e.g. v2.4, where milestone v2.4 is addressed after v2.3 etc.).

Each eRegistrations system has its own iterations, still system specific iteration may cover tasks that are agnostic to any system (that means it also improves other systems or adds given functionality to all other systems)

## Time assignment

The usual time dedicated for _iteration_ tasks is 7 hours per working day, the other 1 hour is left over to address eventual _bugs_ and _fast-track_ issues, and at lowest priority (e.g. other not our stack related tasks) if such work was planned.

The 7 hours _iteration_ dedicated time, also includes time that needs to be devoted for _revision_ of work of other colleagues. Revision time has not strict time assignment, but with use of common sense should taken into account when estimating delivery dates for milestones

The _revision_ should always be treated with priority to not block work of other colleagues.

Discovered _bugs_ should also be treated as a priority. The critical or blocker bugs, should be addressed immediately, the other best if are addressed within 1-3 hours of discovering them.

Time devoted on fixing _bugs_ falls into _fast-track_ hour. So if at one day 1 hour was devoted into _bug_ fixing, then at this day _fast-track_ issues should not be addressed (or if they already been addressed, then _fast-track_ hour should be skipped the next day).

If for some reason discovered bug taken longer time to address (e.g. 4 hours), then this time can be attributed to the milestone that covered delivery of broken feature. As technically such _bug_ means that feature was not delivered in expected shape and had to be revisited.

## Order of tasks

The order in which tasks of given _iteration_ should be addressed is specified on Github on milestone page.

In case of _fast-track_ issues, the order is not specified, howeved tasks with _top-priority_ or _priority_ labels should be addressed in first order, and tasks with _low-priority_ in last order.

## Planning and estimations

When system is actively developed, usual flow is that requests that come when addressing specific milestone/iteration, are postponed for next iteration or if they're quick to address (below 1hr of work), they're scheduled for _fast-track_

### Before work on iteration is started

The iteration should be estimated and result of estimate put into two documents:
- [Overview of current and future tasks](https://docs.google.com/document/d/1cebUp70ElHAYM4vAoLD9lyHQfpuRfzZDN-MiTgQHiEs/edit)  
Here we should put the date where we expect to deliver the iteration
- [Log of past and current tasks](https://docs.google.com/document/d/1is0Y_qwDwBMjXcx_DoWzofP5oXF8jgPAwm5YdLHOqy0/edit)  
Here we should put the date work is started, and estimation in working days (rounded to 1 day)

### When estimated date is not met

If for some reason work on given milestone still continues when its estimated end date is met, the estimate should be updated in [overview](https://docs.google.com/document/d/1cebUp70ElHAYM4vAoLD9lyHQfpuRfzZDN-MiTgQHiEs/edit) document (with  initially input estimation date being preserved).

### When work on iteration is finalized

The task should be removed from [overview](https://docs.google.com/document/d/1cebUp70ElHAYM4vAoLD9lyHQfpuRfzZDN-MiTgQHiEs/edit) document, and total time it took should be filled into [log](https://docs.google.com/document/d/1is0Y_qwDwBMjXcx_DoWzofP5oXF8jgPAwm5YdLHOqy0/edit) document.  
If there were some disruptions during addressing the task, or estimation wasn't met, the reasoning should be provided in dedicated columns.
