// utility for getting previous and next element in a set

'use strict';

module.exports = function (set, currentElement) {
	var prevEl, nextEl, nextInSet
	  , currentEl = currentElement;

	if (!currentElement) return {};
	if (!set) return {};

	if (set.size > 1) {
		var it = set.values();
		var result = it.next();

		while (!result.done && !nextEl) {
			nextInSet = it.next();
			if (result.value === currentEl) {
				nextEl = nextInSet.done ? undefined : nextInSet.value;
			}
			if (!nextInSet.done && nextInSet.value === currentEl) {
				prevEl = result.value;
			}
			result = nextInSet;
		}
	}
	return { prev: prevEl, next: nextEl };
};
