'use strict';

exports._parent        = require('./statistics-flow');
exports._customFilters = Function.prototype;

exports['flow-nav']            = { class: { 'submitted-menu-item-active': true } };
exports['flow-rejections-nav'] = { class: { 'pills-nav-active': true } };

exports['statistics-main'] = function () {
};
