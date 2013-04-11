// W003 Is the warning about variables and function used before they are defined
//jshint -W003
'use strict';

function bind(def, value) {
	if (isDeferred(value))
		value = value.promise;

	if (!isPromise(value))
		return def.resolve(value);

	value.then(def.resolve.bind('resolve'), def.reject.bind('reject'));
	return def.promise;
}

var prom = {
	status: 'unfulfilled',

	init: function() {
		this._cbk = { resolve: [], reject: [] };
		return this;
	},

	then: function(callback, errcall) {
		var def = deferred();

		function okCbk(value) {
			try {
				bind(def, callback(value));
			} catch(err) {
				def.reject(err);
			}
		}

		function failCbk(reason) {
			try {
				bind(def, errcall(reason));
			} catch(err) {
				def.reject(err);
			}
		}

		if (typeof callback === 'function')
			this._cbk.resolve.push(okCbk);
		if (typeof errcall === 'function')
			this._cbk.reject.push(failCbk);

		return def.promise;
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
