'use strict';

module.exports = function (t, a) {
	a(t({}, null), undefined);
	a(t({}, 'foo'), undefined);
	a(t({ 'objId/foo': 1 }, 'foo'), 1);
	a(t({ 'objId/foo': 1 }, 'bar'), undefined);
	a(t({ 'objId/foo': 1, 'objId/bar': 2 }, 'bar'), 2);
	a(t({ 'objId/foo/bar': 1 }, 'foo'), undefined);
	a(t({ 'objId/foo/bar': 1 }, 'bar'), 1);
	a(t({ 'objId/foo/bar': 1 }, 'foo/bar'), 1);
};
