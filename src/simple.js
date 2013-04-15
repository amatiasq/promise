'use strict';

var base = require('./base');

module.exports = base.extend({

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
