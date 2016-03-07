'use strict';

module.exports = function (user, wrapped) {
	return _if(eq(user.managerDataForms._progress, 1), form({ method: 'post',
			action: url('user', user.__id__, 'set-activation'),
			class: 'submitted-menu-role-select',
			id: 'activation-deactivation', autoSubmit: true },
		wrapped ? ul(
			{ class: 'form-elements' },
			p(field({ dbjs: user._isManagerActive }))
		) : p(input({ dbjs: user._isManagerActive }))));
};
