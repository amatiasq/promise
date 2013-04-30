'use strict';

var simple = require('./simple');

var factory = simple.extend({

	adapt: function() {
		var _factory = this._factory;
		return this.then(function(value) {
			return _factory.adapt(value);
		});
	}

}, {

	callback: function() {
		var self = this;

		return function(err, value) {
			if (err)
				self.reject(err);
			else
				self.resolve(value);
		};
	}

});

var toArray = Function.prototype.call.bind([].slice);

factory.adapt = function(target) {
	var _factory = this;
	var result = {};

	Object.keys(target).forEach(function(prop) {
		var value = target[prop];
		var descriptor = Object.getOwnPropertyDescriptor(target, prop);

		if (typeof value !== 'function')
			return Object.defineProperty(result, prop, descriptor);

		result[prop] = function promiseAdapter() {
			var def = _factory();
			var args = toArray(arguments);
			value.apply(target, args.concat(def.callback()));
			return def.promise;
		};
	});

	return result;
};

module.exports = factory;
