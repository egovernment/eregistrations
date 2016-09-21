'use strict';

var d                   = require('d')
  , _                   = require('mano').i18n.bind("Roles input")
  , assign              = require('es5-ext/object/assign')
  , autoBind            = require('d/auto-bind')
  , clear               = require('es5-ext/array/#/clear')
  , db                  = require('../../db')
  , replaceContent      = require('dom-ext/element/#/replace-content')
  , roleEnum            = require('dbjs-dom/input/enum');

var RoleEnumMultiple = roleEnum.Multiple;

var RolesInput = function (document, type/*, options*/) {
	RoleEnumMultiple.apply(this, arguments);
};

RolesInput.prototype = Object.create(RoleEnumMultiple.prototype, assign({
	constructor: d(RolesInput),
	_render: d(function () {
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple checkbox';

		this.firstSubList = this.document.createElement('li');
		this.firstSubList.appendChild(this.document.createElement('ul'));
		this.dom.appendChild(this.firstSubList);

		this.secondSubList = this.document.createElement('li');
		this.secondSubList.appendChild(this.document.createElement('ul'));
		this.dom.appendChild(this.secondSubList);
	})
}, autoBind({
	reload: d(function () {
		var firstSubList  = [], secondSubList = [], title;

		clear.call(this.items);

		title = this.document.createElement('li');
		title.appendChild(document.createTextNode(_("Role(s):")));
		firstSubList.push(title);
		title = this.document.createElement('li');
		title.appendChild(document.createTextNode(_("Page(s):")));
		secondSubList.push(title);

		this.dbList.forEach(function (item) {
			var data = this.renderItem(item.value, item.label);
			this.items.push(data.input);
			if (/^official[A-Z]/.test(item.value) || item.value === 'user' || item.value === 'manager') {
				firstSubList.push(data.dom);
			} else {
				secondSubList.push(data.dom);
			}
		}, this);

		replaceContent.call(this.firstSubList.firstChild, firstSubList, this.markEmpty);
		replaceContent.call(this.secondSubList.firstChild, secondSubList, this.markEmpty);
		this.items.push(this.markEmpty);
	})
})));

roleEnum = roleEnum(db.Role);
roleEnum.DOMMultipleInput = RolesInput;

//db.User.prototype.getOwnDescriptor('roles').DOMMultipleInput = RolesInput;

Object.defineProperties(db.User.prototype.getOwnDescriptor('roles'), {
	inputOptions: d({
		label: false,
		renderItem: function (input, label, value) {
			var el = this.make, isDisabled, rolesMetaEntry;
			rolesMetaEntry = this.observable.object.rolesMeta[value];
			isDisabled = rolesMetaEntry ? rolesMetaEntry._canBeDestroyed.map(function (canBeDestroyed) {
				return !canBeDestroyed;
			}) : false;

			if (isDisabled) {
				var onIsDisabledChanged = function () {
					if (isDisabled.value) {
						input.dom.setAttribute('onclick',
							'event.preventDefault ? event.preventDefault() : (event.returnValue = false)');
					} else {
						input.dom.removeAttribute('onclick');
					}
				};
				isDisabled.on('change', onIsDisabledChanged);
				onIsDisabledChanged();
			}

			return el('li', { class: [_if(isDisabled, "disabled")] }, el('label', input, " ", label));
		}
	})
});
