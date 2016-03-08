// Translate MSSQL id into DBJS id
// Goal is to provide ids that can be translated back so old database id can be retrieved

'use strict';

var done = Object.create(null), taken = Object.create(null);

module.exports = function (id) {
	if (done[id]) return done[id];
	done[id] = parseInt(id.split('-').join('').slice(0, 13), 16).toString(32);
	if (taken[done[id]]) throw new Error("Generated duplicate id");
	taken[done[id]] = true;
	return done[id];
};
