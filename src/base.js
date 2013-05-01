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

function isFn(obj) {
	return typeof obj === 'function';
}

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

		if (def._factory.debug)
			return bind(def, callback(value));

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

function when(value, callback, errback) {
	var def, prom;

	if (isDeferred(value)) {
		prom = value.promise;
	} else if (isPromise(value)) {
		prom = value;
	} else {
		def = this();
		def.resolve(value);
		prom = def.promise;
	}

	return prom.then(callback, errback);
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
		this._cbk.resolve.push(isFn(callback) ? wrap(def, callback) : def.resolve);
		this._cbk.reject.push(isFn(errback) ? wrap(def, errback) : def.reject);
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

		var factory = this._factory;
		var isResolved = action === 'resolve';
		this.promise.status = isResolved ? 'fulfilled' : 'failed';
		this.promise._cbk[action].forEach(function(cbk) { cbk(value) });

		this.promise.then = function(callback, errback) {
			var def = factory();
			var cbk = isResolved ? callback : errback;

			if (isFn(cbk))
				setImmediate(wrap(def, cbk), value);
			else
				setImmediate(def[action], value);

			return def.promise;
		};
	},

	resolve: function(value) {
		this._complete('resolve', value);
	},

	reject: function(value) {
		this._complete('reject', value);
	}

});

module.exports = factory;
