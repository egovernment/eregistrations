'use strict';

var memoize            = require('memoizee/plain')
  , ensureType         = require('dbjs/valid-dbjs-type')
  , defineUserRoleMeta = require('../lib/user-role-meta');

module.exports = memoize(function (User) {
	var db = ensureType(User).database
	  , UserRoleMeta = defineUserRoleMeta(db);

	User.prototype.defineProperties({
		rolesMeta: { type: UserRoleMeta, nested: true },
		canBeDestroyed: { type: db.Boolean, value: function (_observe) {
			return this.roles.every(function (role) {
				return _observe(this.rolesMeta[role]._canBeDestroyed);
			}.bind(this));
		} },
		_destroy: { type: db.Function, value: function (ignore) {
			var db = this.database;
			db.objects.delete(this);
		} },
		destroy: { type: db.Function, value: function (ignore) {
			this.validateDestroy();
			this._destroy();
		} },
		validateDestroy: { type: db.Function, value: function (ignore) {
			this.roles.forEach(function (role) {
				this.rolesMeta[role].validateDestroy();
			}.bind(this));
		} }
	});

	User.prototype.rolesMeta.define('user', {
		nested: true,
		type: UserRoleMeta
	});

	User.prototype.rolesMeta.get('user').set('canBeDestroyed', function (_observe) {
		return !_observe(this.master._submittedBusinessProcessesSize);
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
