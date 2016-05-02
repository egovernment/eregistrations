// Documents list

'use strict';

var find             = require('es5-ext/array/#/find')
  , normalizeOptions = require('es5-ext/object/normalize-options')
  , camelToHyphen    = require('es5-ext/string/#/camel-to-hyphen')
  , _                = require('mano').i18n.bind('View: Component: Documents')
  , isUserApp        = require('../../utils/is-user-app')
  , getSetProxy      = require('../../utils/observable-set-proxy');

module.exports = function (context/*, options*/) {
	var options         = normalizeOptions(arguments[1])
	  , businessProcess = context.businessProcess
	  , urlPrefix       = options.urlPrefix || '/'
	  , target          = options.uploadsResolver || businessProcess
	  , targetMap       = target.requirementUploads
	  , snapshot        = businessProcess.requirementUploads.dataSnapshot

	  , requirementUploads;

	if (isUserApp(context.appName)) {
		// If it's a user, then we show to him direct result of saved snapshot
		requirementUploads = snapshot._resolved;
	} else {
		// Otherwise we show only those items from snapshot which are applicable according
		// to current model state. Additionally for revision case we show processable items even if
		// they're not represented in snapshot
		requirementUploads = snapshot._resolved.map(function (data) {
			return getSetProxy(targetMap.applicable).map(function (upload) {
				var uniqueKey = upload.document.uniqueKey;
				var snapshot = data && find.call(data, function (snapshot) {
					return uniqueKey === snapshot.uniqueKey;
				});
				if (snapshot) return snapshot;
				if (!targetMap.processable) return;
				if (!targetMap.processable.has(upload)) return;
				return upload.enrichJSON(upload.toJSON());
			}).filter(Boolean).toArray();
		});
	}
	return mmap(requirementUploads, function (data) {
		if (!data) return;
		return _if(data._length || data.length, function () {
			return div({ class: 'table-responsive-container' },
				table({
					class: 'submitted-user-data-table user-request-table',
					configuration: {
						collection: requirementUploads,
						columns: [{
							class: 'submitted-user-data-table-status',
							data: function (upload) {
								return [
									_if(eq(upload.status, 'approved'), span({ class: 'fa fa-check' })),
									_if(eq(upload.status, 'rejected'), span({ class: 'fa fa-exclamation' }))
								];
							}
						}, {
							class: 'submitted-user-data-table-label',
							head: _("Documents"),
							data: function (upload) { return upload.label; }
						}, {
							class: 'submitted-user-data-table-date',
							head: _("Issue date"),
							data: function (upload) { return upload.issueDate; }
						}, {
							head: _("Issuer"),
							data: _("User")
						}, {
							class: 'submitted-user-data-table-link',
							data: function (upload) {
								return a({ href: urlPrefix + 'documents/' +
									camelToHyphen.call(upload.uniqueKey) + '/' },
									span({ class: 'fa fa-search' }, _("Go to")));
							}
						}],
						rowAttributes: function (upload) {
							return { id: 'document-item-' + camelToHyphen.call(upload.uniqueKey) };
						}
					}
				}));
		});
	});
};
