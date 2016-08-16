'use strict';

var memoize    = require('memoizee/plain')
  , ensureType = require('dbjs/valid-dbjs-type');

module.exports = memoize(function (User) {
	var db = ensureType(User).database
	  , UserRoleMeta;

	UserRoleMeta = db.Object.extend('UserRoleMeta', {
		destroy: { type: db.Function, value: function () {
			this.validateDestroy();
			this._destroy();
		} },
		_destroy: { type: db.Function },
		canBeDestroyed: { type: db.Boolean, value: true },
		validateDestroy: { type: db.Function, value: function (ignore) {
			if (!this.canBeDestroyed) {
				throw new Error('Cannot destroy user, role restriction: "' + this.key + '"');
			}
		} }
	});

	User.prototype.defineProperties({
		rolesMeta: { type: db.Object, nested: true },
		canBeDestroyed: { type: db.Boolean, value: function (_observe) {
			return this.roles.every(function (role) {
				return _observe(this.rolesMeta[role]._canBeDestroyed);
			}.bind(this));
		} },
		_destroy: { type: db.Function, value: function (ignore) {
			var db = this.database;
			this.roles.forEach(function (role) {
				this.rolesMeta[role]._destroy();
			}.bind(this));
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
	User.prototype.rolesMeta._descriptorPrototype_.type = UserRoleMeta;

	User.prototype.rolesMeta.define('user', {
		nested: true
	});

	User.prototype.rolesMeta.get('user').setProperties({
		_destroy: function (ignore) {
			var dbObjects = this.database.objects;
			this.master.initialBusinessProcesses.forEach(function (bp) {
				dbObjects.delete(bp);
			});
		},
		canBeDestroyed: function (_observe) {
			return !_observe(this.master._submittedBusinessProcessesSize);
		}
	});

	return User;
}, { normalizer: require('memoizee/normalizers/get-1')() });
