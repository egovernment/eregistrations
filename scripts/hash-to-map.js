'use strict';

var strLast = require('es5-ext/string/#/last')
  , ws      = require('esniff/ws')

  , stringify = JSON.stringify
  , $common, $name, $comma, $strName, $value, $string
  , char, str, quote, result, i, last, name;

$name = function () {
	if (char === ':') {
		name = str.slice(last, i - 1).trim();
		last = i;
		return $value;
	}
	return $name;
};
$strName = function () {
	if (char === '\\') {
		char =  str[++i];
		return $strName;
	}
	if (char === quote) return $name;
	return $strName;
};

$comma = function () {
	if (char === ',') {
		last = i;
		return $common;
	}
	return $comma;
};

$value = function () {
	if (char === '{') return $value;
	if (char === '}') {
		result.push([name, str.slice(last, i).trim()]);
		return $comma;
	}
	if (char === '\'') {
		quote = '\'';
		return $string;
	}
	if (char === '"') {
		quote = '"';
		return $string;
	}
	return $value;
};

$string = function () {
	if (char === '\\') ++i;
	if (char === quote) return $value;
	return $string;
};

$common = function () {
	if (ws[char]) return $common;
	if (char === '\'') {
		quote = '\'';
		return $strName;
	}
	if (char === '"') {
		quote = '"';
		return $strName;
	}
	return $name;
};

module.exports = function (value) {
	var state;
	str = String(value).trim();
	if (str[0] !== '{') throw new TypeError("Object expected");
	if (strLast.call(str) !== '}') throw new TypeError("Object expected");
	str = str.slice(1, -1);
	result = [];
	i = last = 0;
	state = $common;
	while ((char = str[i++])) (state = state());
	return '[\n\t' + result.map(function (data) {
		var name = data[0], value = [data[1]];
		if ((name[0] !== '\'') && (name[0] !== '"')) name = stringify(name);
		return '[' + name + ', ' + value + ']';
	}).join(',\n\t') + '\n]';
};
