(function(root) {

var loaded = {};
var mods = {};
var last;

function require(a) {
	return mods[a.replace(/^\.\//, '')];
}

function load(name) {
	if (loaded[name] !== true)
		return;

	mods[name] = mods[name]();
	loaded[name] = true;
}

function define(name, deps, mod) {
	last = name;
	mod = mod || deps;
	var module = { exports: {} };
	if (deps instanceof Array) deps.map(load);
	var result = mod(require, module.exports, module);
	mods[name] = result || module.exports;
}

define('base',['require','exports','module'],function (require, exports, module) {// W003 Is the warning about variables and function used before they are defined
//jshint -W003

// W040 is the usage of 'this' in a non-method function
//jshint -W040



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

});

define('simple',['require','exports','module','./base'],function (require, exports, module) {

var base = require('./base');

var factory = base.extend({

	isResolved: function() {
		return this.status === 'fulfilled';
	},

	isRejected: function() {
		return this.status === 'failed';
	},

	isCompleted: function() {
		return this.status !== 'unfulfilled';
	},

	fin: function(callback) {
		var factory = this._factory;

		function handler(end) {
			var result = callback();

			if (factory.isPromise(result))
				return result.then(end);

			return end();
		}

		return this.then(function(value) {
			return handler(function() { return value });
		}, function(reason) {
			return handler(function() { throw reason });
		});
	}

});

factory.resolved = function(value) {
	var def = this();
	def.resolve(value);
	return def.promise;
};

factory.rejected = function(reason) {
	var def = this();
	def.reject(reason);
	return def.promise;
};

factory.all = function(values) {
	if (!(values instanceof Array))
		values = Array.prototype.slice.call(arguments);

	if (!values.length)
		return this.resolved([]);

	var result = this();
	var outputs = [];
	var promises = values.map(this.when.bind(this));

	promises.forEach(function(promise, index) {
		promise.then(function(output) {
			outputs[index] = output;

			if (promises.every(function(prom) { return prom.isResolved() }))
				result.resolve(outputs);

		}, result.reject);
	});

	return result.promise;
};

module.exports = factory;

});
root.promise = require(last);
})(this)
