//jshint maxlen:200, unused:false
'use strict';

var sinon = require('sinon');
var assert = require('assert');
var baseTest = require('./base.spec');

module.exports = function(deferred) {
	baseTest(deferred);

	describe('With simple implementation', function() {
		var def;
		beforeEach(function() {
			def = deferred();
		});

		describe('when #isResolved is invoked', function() {
			it('should return false on any non-completed promise', function() {
				assert.ok(!def.promise.isResolved());
			});
			it('should return true if the status of the promise is "fulfilled"', function() {
				def.resolve();
				assert.ok(def.promise.isResolved());
			});
		});

		describe('when #isRejected is invoked', function() {
			it('should return false on any non-completed promise', function() {
				assert.ok(!def.promise.isRejected());
			});
			it('should return true if the status of the promise is "fulfilled"', function() {
				def.reject();
				assert.ok(def.promise.isRejected());
			});
		});

		describe('when #isCompleted is invoked', function() {
			it('should return false on any non-completed promise', function() {
				assert.ok(!def.promise.isCompleted());
			});
			it('should return true if the promise is resolved', function() {
				def.resolve();
				assert.ok(def.promise.isCompleted());
			});
			it('should return true if the promise is rejected', function() {
				def.reject();
				assert.ok(def.promise.isCompleted());
			});
		});
	});
};
