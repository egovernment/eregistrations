'use strict';

var db                = require('../../db')
  , assign            = require('es5-ext/object/assign')
  , dateToParamConfig = require('../../apps-common/query-conf/date-to');

module.exports = [
	require('../../apps-common/query-conf/date-from'),
	assign({},
		dateToParamConfig,
		{
			ensure: function (value) {
				if (!value) return new db.Date();
				return dateToParamConfig.ensure(value);
			}
		}),
	require('../../apps-common/query-conf/mode'),
	require('../../apps-common/query-conf/service'),
	require('../../apps-common/query-conf/certificate')
];
