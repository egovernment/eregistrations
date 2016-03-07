'use strict';

module.exports = function (user) {
	return _if(eq(user.managerDataForms._progress, 1), form({ method: 'post',
			action: url('user', user.__id__, 'set-activation'),
			class: 'submitted-menu-role-select',
			id: 'activation-deactivation', autoSubmit: true },
		p(input({ dbjs: user._isManagerActive })),
		p({ class: 'submit' }, input({ type: 'submit' }))));
};
