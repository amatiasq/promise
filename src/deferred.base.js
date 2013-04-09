'use strict';

var prom = {
	then: function() {
		return Object.create(prom);
	}
};

function deferred() {
	return { promise: Object.create(prom) };
}

function isPromise(value) {
	return !!value && typeof value.then === 'function';
}


deferred.isPromise = isPromise;
module.exports = deferred;
