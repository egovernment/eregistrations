'use strict';

var db             = require('mano').db
  , modalContainer = require('./_modal-container')

  , user = db.User.prototype, forEach = Array.prototype.forEach
  , inventoryFields = ['inventoryShelves', 'inventoryCounters']
  , container, resetBtn, totalTxt;

module.exports = modalContainer.appendChild(dialog(
	{ id: 'inventory', class: 'dialog-inventory dialog-modal' },
	header(
		h3("Inventory of your business")
	),
	form(
		container = ul(
			inventoryFields,
			function (name) {
				var list, desc = user.$get(name), control;
				li(
					h3(desc.label),
					p({ class: 'dialog-inventory-item-description' }, desc.description),
					list = div(
						{ class: 'dialog-inventory-single-section-cost' },
						control = user._get(name).toDOMInput(
							document,
							{
								minInputsCount: 1,
								class: 'input',
								item: {
									type: 'edit',
									inputProperties: ['description', 'value'],
									items: {
										description: {
											placeholder: desc.inputPlaceholder
										}
									}
								}
							}
						)
					),
					script(function (list, totalTxt) {

						list = $(list);
						totalTxt = $(totalTxt).firstChild;

						$.onEnvUpdate(list, function () {
							var total = 0;
							$.forEach(list.getElementsByTagName('input'), function (el) {
								if (el.getAttribute('type') !== 'number') return;
								total += Number(el.value) || 0;
							});

							totalTxt.data = '$' + total;

						});
					}, list.getId(), 'span-total-' + name)
				);
				control.dom.querySelector('.controls').appendChild(
					p(
						{ class: 'dialog-inventory-total-section-costs' },
						span("Total: "),
						span({ id: 'span-total-' + name, class: 'dialog-inventory-total' }, "$0")
					)
				);
				control.on('change', function () {
					var items, ph;
					items = list.querySelectorAll('input[type=text]');
					ph = ((items[0] && items[0].getAttribute('placeholder')) ||
							'').slice(0, -1);
					forEach.call(items, function (item, index) {
						item.placeholder = ph + (index + 1);
					});
				});
			}
		),
		footer(
			p(
				resetBtn = a({ onclick: true },
					("Reset all fields"))
			),
			div(
				{ class: 'dialog-inventory-total-value-section' },
				p(
					("Total value of the inventory: "),
					span("$",
						totalTxt = span({ class: 'dialog-inventory-total-value' }, "0"))
				),
				p({ class: 'dialog-inventory-value-save input' },
					input({ type: 'submit', value: ("Save") })),
				script(function (container, resetBtn, totalTxt) {
					container = $(container);
					totalTxt = $(totalTxt).firstChild;
					$(resetBtn).onclick = function () {
						var lis = container.getElementsByTagName('li'), i, li;
						for (i = lis.length - 1; (li = lis[i]); --i) {
							if (!li.previousSibling) continue;
							if (!$(li.parentNode.parentNode).hasClass('multiple')) continue;
							li.parentNode.removeChild(li);
						}
						$.forEach(container.getElementsByTagName('input'), function (el) {
							el.value = '';
						});
						$.propagateEnvUpdate(container);
					};
					$.onEnvUpdate(container, function () {
						var total = 0;
						$.forEach(container.getByClass('span', 'dialog-inventory-total'), function (p) {
							total += Number(p.firstChild.data.slice(1)) || 0;
						});
						totalTxt.data = total;
					});
				}, container.getId(), resetBtn.getId(), totalTxt.getId())
			)
		)
	)
));
