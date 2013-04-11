// W003 Is the warning about variables and function used before they are defined
//jshint -W003

// W040 is the usage of 'this' in a non-method function
//jshint -W040

'use strict';

// Sinon.js does not mock setImmediate yet so we will redirect it to setTimeout
//   until this is supported
var setImmediate = function(callback, args) {
	setTimeout(callback, 0, args);
};

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

function merge(target, source) {
	Object.keys(source).forEach(function(key) {
		var descriptor = Object.getOwnPropertyDescriptor(source, key);
		Object.defineProperty(target, key, descriptor);
	});
	return target;
}


function isPromise(value) {
	return !!value && typeof value.then === 'function';
}
function isDeferred(value) {
	return !!value && isPromise(value.promise);
}

function when(value) {
	var def = this();

	if (isDeferred(value))
		value = value.promise;

	if (isPromise(value))
		value.then(def.resolve.bind(def), def.reject.bind(def));
	else
		def.resolve(value);

	return def.promise;
}


function extend(promExtension, defExtension) {
	function Promise() {
		this.init();
	}
	function Deferred() {
		this.promise = new Promise();
		this.init();
	}

	Promise.prototype = Object.create(this.proto.promise);
	if (promExtension)
		merge(Promise.prototype, promExtension);

	Deferred.prototype = Object.create(this.proto.deferred);
	if (defExtension)
		merge(Deferred.prototype, defExtension);

	function deferred() {
		return new Deferred();
	}
	merge(deferred, this);

	deferred.proto = {
		deferred: Deferred.prototype,
		promise: Promise.prototype,
	};

	Promise.prototype._factory = deferred;
	Deferred.prototype._factory = deferred;

	return deferred;
}

var factory = extend.call({
	proto: {
		promise: Object.prototype,
		deferred: Object.prototype,
	},

	// Static methods
	extend: extend,
	isDeferred: isDeferred,
	isPromise: isPromise,
	when: when,

}, {

	// Promise methods

	init: function() {
		this.status = 'unfulfilled';
		this._cbk = { resolve: [], reject: [] };
	},

	then: function(callback, errback) {
		var def = this._factory();

		if (typeof callback === 'function')
			this._cbk.resolve.push(wrap(def, callback));

		if (typeof errback === 'function')
			this._cbk.reject.push(wrap(def, errback));

		return def.promise;
	},

}, {

	// Deferred methods

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
			function(callback) { setImmediate(callback, value) } :
			function(callback, errback) { setImmediate(errback, value) };
	},

	resolve: function(value) {
		this._complete('resolve', value);
	},

	reject: function(value) {
		this._complete('reject', value);
	}

});

module.exports = factory;
