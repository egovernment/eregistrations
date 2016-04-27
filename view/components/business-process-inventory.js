'use strict';

var _       = require('mano').i18n.bind('View: Component: Inventory')
  , forEach = Array.prototype.forEach;

module.exports = function (businessProcess) {
	var container, resetBtn, totalTxt;
	return dialog(
		{ id: 'inventory', class: 'dialog-inventory dialog-modal' },
		header(
			h3(_("Inventory of your business"))
		),
		form(
			{ action: '/inventory', method: 'post' },
			container = ul(
				businessProcess.inventory,
				function (item, name) {
					var list, desc = businessProcess.inventory.getDescriptor(name), control;
					li(
						h3(desc.label),
						p({ class: 'dialog-inventory-item-description' }, desc.description),
						list = div(
							{ class: 'dialog-inventory-single-section-cost' },
							control = input(
								{ dbjs: item._map,
									minInputsCount: 1, class: 'input',
									item: { type: 'edit',
										inputProperties: ['description', 'value'], items: {
										description: { placeholder:
											desc.inputPlaceholder }
									} }
									}
							)._dbjsInput
						),
						script(function (list, totalTxt) {

							list = $(list);
							totalTxt = $(totalTxt);

							$.onEnvUpdate(list, function () {
								var total = 0;
								$.forEach(list.getElementsByTagName('input'), function (el) {
									if (el.getAttribute('type') !== 'number') return;
									total += Number(el.value) || 0;
								});
								totalTxt.firstChild.data = $.formatCurrency(total);
								totalTxt.setAttribute('totalvalue', total);
							});
						}, list.getId(), 'span-total-' + name)
					);

					control.dom.appendChild(
						p(
							{ class: 'dialog-inventory-total-section-costs' },
							span("Total: "),
							span({ id: 'span-total-' + name, class: 'dialog-inventory-total' }, "0")
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
					resetBtn = a(
						{ onclick: true },
						_("Reset all fields")
					)
				),

				div(
					{ class: 'dialog-inventory-total-value-section' },
					p(
						_("Value of the inventory to the date") + ":",
						span(totalTxt = span({ class: 'dialog-inventory-total-value' }, "0"))
					),
					p(
						{ class: 'dialog-inventory-value-save input' },
						input({ type: 'submit', value: _("Save") })
					),
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
								if (el.type !== 'hidden') {
									el.value = '';
								}
							});
							$.propagateEnvUpdate(container);
						};
						$.onEnvUpdate(container, function () {
							var total = 0;
							$.forEach(container.getByClass('span', 'dialog-inventory-total'), function (p) {
								var n = Number(p.getAttribute('totalvalue')) || 0;
								total += n;
							});
							totalTxt.data = $.formatCurrency(total);
						});
					}, container.getId(), resetBtn.getId(), totalTxt.getId())
				)
			)
		)

	);
};
