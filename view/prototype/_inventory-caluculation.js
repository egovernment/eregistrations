'use strict';

var db = require('mano').db,
		user = db.User.prototype,
		forEach = Array.prototype.forEach,
		container,
		resetBtn,
		totalTxt,
		inventario,
		closeBtn,
		invForm,
		inventoryFields = ['inventoryShelves', 'inventoryCounters'];

module.exports = inventario = modal(
	{ class: 'modal-inventory' },
	section(
		header(
			h3("Inventory of your business")
		),
		invForm = form(
			{ action: url('inventory'), method: 'post' },
			container = ul(
				inventoryFields,
				function (name) {
					var list, totalTxt, desc = user.$get(name), control;
					li(
						h3(desc.label),
						p(desc.description),
						list = div(
							control = user._get(name).toDOMInput(
								document,
								{
									minInputsCount: 1,
									item: {
										type: 'edit',
										inputProperties: ['description', 'value'],
										items: {
											description: {
												placeholder: desc.inputPlaceholder
											}
										}
									},
									addLable: i("icon"),
									deleteLabel: function () {
										return i("delete");
									}
								}
							)
						),
						totalTxt = p({ class: 'total' }, "$0"),
						p("Total"),
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
						}, list.getId(), totalTxt.getId())
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
					resetBtn = a({ class: 'btn-red', onclick: true },
						("Restablecer todos los campos"))
				),
				p(
					("Valor del inventario a la fecha: "),
					span({ class: 'total-value-container' }, "$",
						totalTxt = span({ class: 'total-value' }, "0"))
				),
				p(input({ type: 'submit', value: ("Utilizar") })),
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
						$.forEach(container.getByClass('p', 'total'), function (p) {
							total += Number(p.firstChild.data.slice(1)) || 0;
						});
						totalTxt.data = total;
					});
				}, container.getId(), resetBtn.getId(), totalTxt.getId())
			)
		)
	)
);
//closeBtn.castAttribute('onclick', inventario.hide);
invForm.castAttribute('onsubmit', inventario.hide);
