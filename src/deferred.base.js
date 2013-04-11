// W003 Is the warning about variables and function used before they are defined
//jshint -W003
'use strict';

function noop() { }
function bind(def, value) {
	if (isDeferred(value))
		value = value.promise;

	if (!isPromise(value))
		return def.resolve(value);

	value.then(def.resolve.bind('resolve'), def.reject.bind('reject'));
	return def.promise;
}

function wrap(def, callback) {
	return function(value) {
		try {
			bind(def, callback(value));
		} catch(err) {
			def.reject(err);
		}
	};
}

function Promise() {
	this.init();
}
Promise.prototype = {
	init: function() {
		this.status = 'unfulfilled';
		this._cbk = { resolve: [], reject: [] };
	},

	then: function(callback, errback) {
		var def = deferred();

		if (typeof callback === 'function')
			this._cbk.resolve.push(wrap(def, callback));

		if (typeof errback === 'function')
			this._cbk.reject.push(wrap(def, errback));

		return def.promise;
	}
};

function Deferred() {
	this.promise = new Promise();
	this.init();
}
Deferred.prototype = {
	get status() {
		return this.promise.status;
	},

	init: function() {
		this.resolve = this.resolve.bind(this);
		this.reject = this.reject.bind(this);
	},

	_complete: function(action, value) {
		if (this.promise.status !== 'unfulfilled')
			return;

		var isResolved = action === 'resolve';
		this.promise.status = isResolved ? 'fulfilled' : 'failed';
		this.promise._cbk[action].forEach(function(cbk) { cbk(value) });

		this.promise.then = isResolved ?
			function(callback) { callback(value) } :
			function(callback, errback) { errback(value) };

		this.resolve = noop;
		this.reject = noop;
	},

	resolve: function(value) {
		this._complete('resolve', value);
	},

	reject: function(value) {
		this._complete('reject', value);
	}
};

function deferred() {
	return new Deferred();
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

deferred.isDeferred = isDeferred;
deferred.isPromise = isPromise;
deferred.when = when;
module.exports = deferred;
