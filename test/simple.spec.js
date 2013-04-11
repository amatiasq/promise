//jshint maxlen:200, unused:false
'use strict';

var sinon = require('sinon');
var assert = require('assert');
var baseTest = require('./base.spec');

module.exports = function(deferred) {
	baseTest(deferred);

	describe('Status methods', function() {
		it('#isResolved should return true if the status of the promise is "fulfilled"', function() {
			var def = deferred();
			assert.ok(!def.promise.isResolved());
			def.resolve();
			assert.ok(def.promise.isResolved());
		});

		it('#isRejected should return true if the status of the promise is "failed"', function() {
			var def = deferred();
			assert.ok(!def.promise.isRejected());
			def.reject();
			assert.ok(def.promise.isRejected());
		});

		it('#isCompleted should return true if the status is not "unfulfilled"', function() {
			var def = deferred();
			assert.ok(!def.promise.isCompleted());
			def.resolve();
			assert.ok(def.promise.isCompleted());

			def = deferred();
			assert.ok(!def.promise.isCompleted());
			def.reject();
			assert.ok(def.promise.isCompleted());
		});
	});
};
