'use strict';

var $    = require('mano-legacy')
  , live = require('mano-legacy/live');

require('mano-legacy/for-each');
require('mano-legacy/for-in');
require('mano-legacy/make-element');
require('mano-legacy/select-match');

require('mano-legacy/element#/parent-by-name');
/**
 * Establishes an interaction between two selects
 * (one which holds parent and second which holds children)
 * i.e. businessActivityCategory and businessActivity
 * So when user selects a parent, only this parent's children will be shown in the children select
 * For this to work you must:
 * 1. Generate a map with help of scripts/generate-legacy-controls-map.js
 * 2. Create a binding to specified htmlClass
 *    (you pass the htmlClass name to scripts/generate-legacy-controls-map.js)
 *    binding may look like this:
 *    var d  = require('d')
 *      , db = require('mano').db;
 *    Object.defineProperties(db.BusinessActivity, {
 *      inputOptions: d({ class: 'business-activity-control' })
 *    });
 * 3. call this util from your app's client/legacy/index and pass the generated file as param
 *    i.e:
 *    require('eregistrations/client/legacy/controls-map')
 *    (require('../../../../apps-common/client/legacy/generated/
 *    business-activity-category-map.generated'));
 *
 * @param config {object} - The generated map (don't pass anything manually)
 */
module.exports = function (config) {
	live.add('select', 'class', config.htmlClass, function self(childSelect) {
		var parentSelect, parentOptions = {}, options = {}, child, parentMap
		  , map = {}, selectedParentOption, updateSelect
		  , selectedDeptOption, deptMap = {};

		parentMap = config.map;

		childSelect = $(childSelect);
		parentSelect = childSelect.parentByName('li').previousSibling.getElementsByTagName('select')[0];
		if (!parentSelect) {
			// There's a race condition when this function is run before parentSelect is accessible
			setTimeout(function timeoutSelf() {
				if (!childSelect.parentByName('li')) setTimeout(timeoutSelf, 300);
				else self(childSelect);
			}, 300);
			return;
		}
		parentSelect.removeAttribute('name');

		child = childSelect.value;

		// Gather options
		$.forEach(childSelect.getElementsByTagName('option'), function (option) {
			options[option.value] = option;
		});

		$.forEach(parentSelect.getElementsByTagName('option'), function (option) {
			parentOptions[option.value] = option;
			if (option.selected) {
				selectedParentOption = option;
			}
		});

		$.forIn(parentMap, function (parentItem, parentId) {
			var list = map[parentId] = [];
			$.forEach(parentItem.items, function (childId, i) {
				list[i] = options[childId];
				deptMap[childId] = parentId;
				if (childId === child) {
					selectedDeptOption = options[childId];
				}
			});
		});

		// Invoke match
		updateSelect = $.selectMatch(parentSelect, map);
		parentSelect.disabled = childSelect.disabled;
		setInterval(function () {
			parentSelect.disabled = childSelect.disabled;
		}, 1000);

		if (!childSelect._dbjsInput) return;
		document.on('dbupdate', function () { parentSelect.disabled = childSelect.disabled; });
		childSelect._dbjsInput.observable.on('change', function (event) {
			var child, parent;

			child = event.newValue && event.newValue.__id__;
			parent = child ? deptMap[child] : '';

			if (selectedParentOption) {
				selectedParentOption.removeAttribute('selected');
			}
			selectedParentOption = parentOptions[parent];

			if (selectedParentOption) {
				selectedParentOption.setAttribute('selected', 'selected');
			}
			parentSelect.value = parent;
			updateSelect();

			if (selectedDeptOption) selectedDeptOption.removeAttribute('selected');
			selectedDeptOption = options[child];

			if (selectedDeptOption) {
				selectedDeptOption.setAttribute('selected', 'selected');
			}
			childSelect.value = child;
		});
	});
};
