"use strict";

// todo: ensure localStorage is available, and have a backup plan if it isn't

// from here: https://stackoverflow.com/a/6000016/1525759
function isFunction(obj) {
	return !!(obj && obj.constructor && obj.call && obj.apply);
}

function setSetting(name, value) {
	localStorage.setItem(name, JSON.stringify(value));
}

function getSetting(name, defaultValue) {
	const val = localStorage.getItem(name);
	if (!val) {
		const theVal = isFunction(defaultValue) ? defaultValue() : defaultValue;
		setSetting(name, theVal);
		return theVal;
	}
	return JSON.parse(val);
}

