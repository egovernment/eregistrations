// Documents viewer

'use strict';

var curry = require('es5-ext/function/#/curry')
  , _     = require('mano').i18n.bind('Revision: Document history');

module.exports = function (doc) {
	return [
		insert(_if(doc.statusLog.ordered._size, [
			h3(_("Document history")),
			div(
				{ class: 'submitted-user-history-wrapper' },
				table(
					{ class: 'submitted-user-history' },
					tbody(
						doc.statusLog.ordered,
						function (log) {
							th(log.label);
							td({ class: 'submitted-user-history-time' }, log.time);
							td(log.text && log.text.split('\n').filter(Boolean).map(curry.call(p, 1)));
						}
					)
				)
			)]))
	];
};
