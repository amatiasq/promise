'use strict';

var prom = {
	status: 'unfulfilled',
	_cbk: { resolve: [], reject: [] },

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
		promise: Object.create(prom),

		resolve: function(value) {
			this.promise.status = 'fulfilled';
			this.promise._cbk.resolve.forEach(function(a) { a(value) });
			this.promise.then = function(callback) { callback(value); };
			this.resolve = function() { };
		},

		reject: function(reason) {
			this.promise.status = 'failed';
			this.promise._cbk.reject.forEach(function(a) { a(reason) });
			this.promise.then = function(callback, errcall) { errcall(reason) };
			this.reject = function() { };
		}
	};
}

function isPromise(value) {
	return !!value && typeof value.then === 'function';
}


deferred.isPromise = isPromise;
module.exports = deferred;
