// Official data view

'use strict';

var businessProcessData = require('./_business-process-documents-and-data');

exports._parent = require('./business-process-official');

exports.tab = {
	content: function () {
		businessProcessData(this.businessProcess);
	}
};
