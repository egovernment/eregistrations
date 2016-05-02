'use strict';

module.exports = function (t, a) {
	a(t(), null);
	a(t('foo'), '/foo');
	a(t('foo/bar'), '/foo/bar');
	a(t('foo/b&ar'), '/foo/b%26ar');
};
