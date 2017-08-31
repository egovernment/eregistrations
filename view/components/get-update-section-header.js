'use strict';

module.exports = function (section, updateValue, btnText, message) {
	return function (defaultHeader) {
		return div({ class: "section-update-header-container" },
			defaultHeader,
			div({ class: "section-update-header-side-panel" },
				_if(and(message, section._lastEditStamp), span(
					message
				)), button({
					type: "submit",
					onclick: function () {
						section.isAwaitingUpdate = updateValue;
					}
				}, btnText)));
	};
};
