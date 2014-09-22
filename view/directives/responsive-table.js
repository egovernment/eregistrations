'use strict';

var memoize = require('memoizee/weak')

  , forEach = Array.prototype.forEach;

module.exports = function (domjs) {
	domjs.getDirectives('table').responsive = function () {
		var transform, document = this.ownerDocument
		  , headings = this.querySelectorAll('thead > tr:first-child > th')
		  , tbody = this.querySelector('tbody')
		  , observer;
		this.classList.add('table-responsive');
		transform = memoize(function (row) {
			forEach.call(row.children, function (cell, index) {
				var body, caption;
				if (!headings[index]) return;
				caption = document.createElement('div');
				caption.className = 'cell-caption';
				forEach.call(headings[index].childNodes, function (node) {
					caption.appendChild(node.cloneNode(true));
				});
				body = document.createElement('div');
				body.className = 'cell-body';
				while (cell.firstChild) body.appendChild(cell.firstChild);
				cell.appendChild(caption);
				cell.appendChild(body);
			});
		});
		forEach.call(tbody.children, transform);
		observer = new MutationObserver(function (mutations) {
			mutations.forEach(function (mutation) {
				if (!mutation.addedNodes) return;
				forEach(mutation.addedNodes, transform);
			});
		});
		observer.observe(tbody, { childList: true });
	};
};
