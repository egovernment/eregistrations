'use strict';

function contains(a, searchString) {
	return a.indexOf(searchString) !== -1;
}

function doesNotContain(a, searchString) {
	return !contains(a, searchString)
}

function getMinutes(s) {
	var split = s.split(/[ ,]+/);
	if (split[split.length - 1] === 'm') {
		return parseInt(split[split.length - 2])
	} else {
		return 0
	}
}

function getHours(s) {
	var split = s.split(/[ ,]+/);
	var hourIndex = split.indexOf('h');
	if (hourIndex !== -1){
		return parseInt(split[hourIndex - 1])
	} else {
		return 0
	}
}

function getNumericalTime(s) {
	return getHours(s) * 100 + getMinutes(s)
}

module.exports = function (a, b) {
	function compareTimeFunc(a, b) {
		//a<b
		if (a === '-' && b === '-') {
			return 0
		}

		if (a === '-' && b !== '-') {
			return 1
		}

		if (a === '< 1 m' && b === '< 1 m') {
			return 0
		}

		if (a === '< 1 m' && contains(b, 'm')) {
			return 1
		}
		if (a === '< 1 m' && contains(b, 'h')) {
			return 1
		}

		if (doesNotContain(a, 'h') && contains(b, 'h')) {
			return 1
		}

		if(getNumericalTime(a) < getNumericalTime(b)){
			return 1
		}

		return 0
	}

	var result = compareTimeFunc(a, b);
	if (result === 0) {
		return compareTimeFunc(b, a) * -1;
	}
	return result;
}
