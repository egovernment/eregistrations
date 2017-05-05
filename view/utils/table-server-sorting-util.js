'use strict';

module.exports =  function (id, opts) {
	setTimeout(function () {
		var elem = jQuery('#' + id + '[col=' + opts.col + ']');
		elem.addClass('tablesorter-default');
		if(asc === '1'){
			elem.addClass('headerSortUp')
		}else{
			elem.addClass('headerSortDown')
		}
		elem.wrapInner( "<div class='tablesorter-header-inner'></div>" );
	}, 250);
};
