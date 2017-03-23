'use strict';

var db                 = require('../../db')
  , defineDbjsDate     = require('dbjs-ext/date-time/date')
  , defineHolidays     = require('../../model/global-primitives/holidays')
  , defineWorkingHours = require('../../model/global-primitives/working-hours');

module.exports = function (t, a) {
	defineDbjsDate(db);
	defineWorkingHours(db);
	defineHolidays(db);
	db.globalPrimitives.workingHours.start.hours   = 9;
	db.globalPrimitives.workingHours.start.minutes = 0;
	db.globalPrimitives.workingHours.end.hours     = 17;
	db.globalPrimitives.workingHours.end.minutes   = 0;
	// hours are taken as of UTC (default tz)
	// from 13:58, to 14:58 same day, within working hours
	a(t(1490191106777, 1490194706777), 3600000);
	// from 13:58, to 14:58 next day, within working hours
	a(t(1490191106777, 1490281106777), 32400000);
	//from 13:58, to 14:58 two days later, within working hours
	a(t(1490191106777, 1490367506777), 61200000);
  // from 17:58 (after working hours) to 14:58 next day
	a(t(1490205506777, 1490281106777), 21480000);

	db.globalPrimitives.workingHours.start.minutes = 45;
	db.globalPrimitives.workingHours.end.minutes   = 30;
	// from 13:58, to 14:58 same day, within working hours
	a(t(1490191106777, 1490194706777), 3600000);
	// from 13:58, to 14:58 next day, within working hours
	a(t(1490191106777, 1490281106777), 31500000);
	//from 13:58, to 14:58 two days later, within working hours
	a(t(1490191106777, 1490367506777), 59400000);
	// from 17:58 (after working hours) to 14:58 next day
	a(t(1490205506777, 1490281106777), 18780000);

	db.globalPrimitives.workingHours.start.minutes = 0;
	db.globalPrimitives.workingHours.end.minutes   = 0;
	// from 7:00 to 14:58
	a(t(1490158826777, 1490194706777), 21480000);
	// from 7:00 to 8:50, before processing working hours
	a(t(1490158826777, 1490159246777), 0);

	//from 13:58, to 6:58 two days later, before working hours
	a(t(1490191106777, 1490335106777), 39720000);

	/**
	 * The test for days off was removed, due to setup comlications
	 * (min on holidays, db.globalPrimirives.holidays exposed beyond scope of function,
	 * so unable to setup from here), unless tweaking other setup
	 *
	 * db.globalPrimitives.holidays.add(1490227200000);
	 * //from 13:58, to 14:58 two days later, within working hours, but day in the middle is holidays
	 * a(t(1490191106777, 1490367506777), 32400000);
	 *
	 */
};
