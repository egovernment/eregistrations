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
		this.dom = ul({ class: 'dbjs multiple checkbox' },
			li(
				h4(_("Part A:")),
				this.firstSubList = ul()
			),
			li(
				h4(_("Roles (Part B):")),
				this.secondSubList = ul()
			),
			li(
				h4(_("Page(s):")),
				this.thirdSubList = ul()
			),
			this.markEmpty);
	}),
	customRenderItem: d(function (input, label, value) {
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

		return el('li', { class: [_if(isDisabled, "disabled")] },
			el('label', { class: "input-aside" }, el('span', input), " ", label));
	})
}, autoBind({
	reload: d(function () {
		var firstSubList  = [], secondSubList = [], thirdSubList = [];

		clear.call(this.items);
		this.dbList.forEach(function (item) {
			var longLabel, label, data;
			longLabel = db.Role.meta[item.value].longLabel;
			label = longLabel ? longLabel + ' (' + item.label + ')' : item.label;
			data = this.renderItem(item.value, label);
			this.items.push(data.input);
			if (db.Role.isPartARole(item.value)) {
				firstSubList.push(data.dom);
			} else if (db.Role.isOfficialRole(item.value)) {
				secondSubList.push(data.dom);
			} else {
				thirdSubList.push(data.dom);
			}
		}, this);

		replaceContent.call(this.firstSubList, firstSubList);
		replaceContent.call(this.secondSubList, secondSubList);
		replaceContent.call(this.thirdSubList, thirdSubList);
		this.items.push(this.markEmpty);
	})
})));

db.User.prototype.getOwnDescriptor('roles').DOMInput = RolesInput;
