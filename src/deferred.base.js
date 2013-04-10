'use strict';

var prom = {
	status: 'unfulfilled',

	init: function() {
		this._cbk = { resolve: [], reject: [] };
		return this;
	},

	then: function(callback, errcall) {
		if (typeof callback === 'function')
			this._cbk.resolve.push(callback);
		if (typeof errcall === 'function')
			this._cbk.reject.push(errcall);
		return Object.create(prom);
	},
};

function deferred() {
	return {
		promise: Object.create(prom).init(),

		resolve: function(value) {
			this.promise.status = 'fulfilled';
			this.promise._cbk.resolve.forEach(function(a) { a(value) });
			this.promise.then = function(callback) { callback(value); };
			this.resolve = function() { };
			this.reject = function() { };
		},

		reject: function(reason) {
			this.promise.status = 'failed';
			this.promise._cbk.reject.forEach(function(a) { a(reason) });
			this.promise.then = function(callback, errcall) { errcall(reason) };
			this.resolve = function() { };
			this.reject = function() { };
		}
	};
}

function isPromise(value) {
	return !!value && typeof value.then === 'function';
}
function isDeferred(value) {
	return !!value && isPromise(value.promise);
}

function when(value) {
	var def = deferred();

	if (isDeferred(value))
		value = value.promise;

	if (isPromise(value))
		value.then(def.resolve.bind(def), def.reject.bind(def));
	else
		def.resolve(value);

	return def.promise;
}


deferred.isPromise = isPromise;
deferred.when = when;
module.exports = deferred;
