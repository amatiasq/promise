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

function wrap(_factory, target, fn) {
	return function promiseAdapter() {
		var def = _factory();
		fn.apply(target, toArray(arguments).concat(def.callback()));
		return def.promise;
	};
}

factory.adapt = function(target) {
	var result = Object.create(target);

	for (var prop in target)
		if (typeof target[prop] === 'function')
			result[prop] = wrap(this, target, target[prop]);

	return result;
};

module.exports = factory;
