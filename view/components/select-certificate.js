'use strict';

var _            = require('mano').i18n.bind('View: Select Certificate')
  , db           = require('../../db')
  , location     = require('mano/lib/client/location');

module.exports = function (/* opts */) {
	var opts, name, label, id, certificateQuery, certificates = {};
	opts             = Object(arguments[0]);
	name             = opts.name || 'certificate';
	label            = opts.label || _("All certificates");
	id               = opts.id || 'certificate-select';
	certificateQuery = location.query.get(name);

	db.BusinessProcess.extensions.forEach(function (ServiceType) {
		ServiceType.prototype.certificates.map.forEach(function (certificate) {
			if (!certificates[certificate.key]) {
				certificates[certificate.key] = { label: certificate.label };
			}
		});
	});

	return select(
		{ id: id, name: 'certificate' },
		option({ value: '', selected: certificateQuery.map(function (value) {
			return value ? null : 'selected';
		}) }, label),
		list(Object.keys(certificates), function (certificateKey) {
			return option({
				id: 'certificate-' + certificateKey,
				value: certificateKey,
				selected: location.query.get('certificate').map(function (value) {
					var selected = (certificateKey ? (value === certificateKey) : (value == null));
					return selected ? 'selected' : null;
				})
			}, certificates[certificateKey].label);
		})
	);
};
