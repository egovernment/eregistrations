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
		var title, firstContainer, secondContainer;
		this.dom = this.document.createElement('ul');
		this.dom.className = 'dbjs multiple checkbox';

		firstContainer = this.document.createElement('li');
		this.dom.appendChild(firstContainer);

		secondContainer = this.document.createElement('li');
		this.dom.appendChild(secondContainer);

		title = this.document.createElement('h4');
		title.appendChild(document.createTextNode(_("Role(s):")));
		firstContainer.appendChild(title);

		title = this.document.createElement('h4');
		title.appendChild(document.createTextNode(_("Page(s):")));
		secondContainer.appendChild(title);

		this.firstSubList = this.document.createElement('ul');
		firstContainer.appendChild(this.firstSubList);

		this.secondSubList = this.document.createElement('ul');
		secondContainer.appendChild(this.secondSubList);
	})
}, autoBind({
	reload: d(function () {
		var firstSubList  = [], secondSubList = [];

		clear.call(this.items);

		this.dbList.forEach(function (item) {
			var data = this.renderItem(item.value, item.label);
			this.items.push(data.input);
			switch (item.value) {
			case 'user':
			case 'manager':
			case 'dispatcher':
			case 'supervisor':
				firstSubList.push(data.dom);
				break;
			default:
				if (/^official[A-Z]/.test(item.value)) {
					firstSubList.push(data.dom);
				} else {
					secondSubList.push(data.dom);
				}
			}
		}, this);

		replaceContent.call(this.firstSubList, firstSubList, this.markEmpty);
		replaceContent.call(this.secondSubList, secondSubList, this.markEmpty);
		this.items.push(this.markEmpty);
	})
})));

roleEnum = roleEnum(db.Role);
roleEnum.DOMMultipleInput = RolesInput;

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
