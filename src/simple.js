'use strict';

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
