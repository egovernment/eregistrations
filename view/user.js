// User: Basic data for business processes

'use strict';

var _                = require('mano').i18n.bind('View: User')
  , renderServiceBox = require('./components/render-service-box');

exports._parent = require('./user-base');

exports['sub-main'] = {
	class: { content: true, 'user-forms': true },
	content: function () {
		var manager = this.manager, revertedBusinessProcesses = this.user.revertedBusinessProcesses;

		div({ class: 'user-account-boxes' },
			section({ id: 'welcome-box', class: 'user-account-welcome' },
				_if(manager, function () {
					return manager._currentlyManagedUser.map(function (managedUser) {
						if (!managedUser) return;

						return [header(h3(_("View for client: ${ clientFullName }",
							{ clientFullName: managedUser._fullName }))), div({ class: 'free-form' },
								md(_("1. From here you can access all the requests of this client in draft, " +
									"in process, finished\n" +
									"2. Start a new service for this client\n" +
									"3. Create an account for this client if not done already")))];
					}.bind(this));
				}.bind(this), function () {
					return [
						header(
							h3(_("Welcome to your account. From here you can:"))
						),
						div({ class: 'free-form' },
							md(_("1. Access all your requests in draft, in process, finished\n" +
								"2. Access and edit your documents and data\n" +
								"3. Start a new service related to your company")))
					];
				}.bind(this))));

		exports._notificationsBox.call(this);

		insert(_if(gt(revertedBusinessProcesses._size, 0), function () {
			div({ class: 'section-warning' },
				ul(
					revertedBusinessProcesses.map(function (pendingProcess) {
						return li({ class: 'section-warning-action' }, div(
							span({ class: "section-warning-action-description" },
								_('${ businessName } is pending for corrections',
									{ businessName: pendingProcess._businessName })),
							span({ class: "section-warning-action-button" }, postButton({
								action: url('business-process', pendingProcess.__id__),
								value: _('Correct now')
							}))
						));
					})
				));
		}));

		section({ class: 'section-tab-nav' },
			a({ class: 'section-tab-nav-tab user-account-tab',
				id: 'user-account-requests',
				href: '/' },
				_if(manager, _("Requests"), _("My requests"))),
			a({ class: 'section-tab-nav-tab user-account-tab',
				id: 'user-account-data',
				href: '/requests/' },
				_if(manager, _("Documents and data"), _("My documents and data"))),
			div({ id: 'user-account-content', class: 'section-primary' }));

		insert(_if(!manager || eq(this.user._manager, manager), [
			exports._followUpsBoxes.call(this),
			h3({ class: 'user-account-section-title' }, _("Available services")),
			section({ class: 'section-primary' },
				ul({ class: 'user-account-service-boxes' },
					exports._servicesBoxList.call(this),
					renderServiceBox
					))]));

	}
};

exports._notificationsBox = Function.prototype;
exports._servicesBoxList  = Function.prototype;
exports._followUpsBoxes   = Function.prototype;
