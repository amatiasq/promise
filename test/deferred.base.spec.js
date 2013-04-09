//jshint maxlen:200
'use strict';

var sinon = require('sinon');
var assert = require('assert');
var deferred = require('../src/deferred.base');

describe('Deferred', function() {

	it('module should be a callable function', function() {
		assert.equal(typeof deferred, 'function');
	});
	it('module return value should be thruthy', function() {
		assert.ok(deferred());
	});

	describe('object', function() {
		var sut;
		beforeEach(function() {
			sut = deferred();
		});

		describe('#promise property', function() {
			var prom;
			beforeEach(function() {
				prom = sut.promise;
			});

			it('should exist', function() {
				assert.ok('promise' in sut);
			});

			it('should have "unfulfilled" as default status', function() {
				assert.equal(prom.status, 'unfulfilled');
			});

			it('should return true when passed to deferred.isPromise()', function(){
				assert.ok(deferred.isPromise(prom));
			});
			it('should have a "#then()" method', function() {
				assert.equal(typeof prom.then, 'function');
			});

			describe('#then method', function() {
				it('should return another promise', function() {
					assert.ok(deferred.isPromise(prom.then()));
					assert.notEqual(prom.then(), prom);
				});
			});
		});

		describe('#resolve method', function() {
			it('should be a function', function() {
				assert.equal(typeof sut.resolve, 'function');
			});

			var clock, spy;
			beforeEach(function() {
				clock = sinon.useFakeTimers();
				spy = sinon.spy();
			});

			afterEach(function() {
				clock.restore();
			});

			it('should change promise status to "fulfilled"', function() {
				sut.resolve();
				assert.equal(sut.promise.status, 'fulfilled');
			});

			it('should invoke all functions first argument passed to #promise.then() when called on the next event loop', function() {
				sut.promise.then(spy);
				sut.resolve();
				clock.tick(1);
				assert.ok(spy.calledOnce);
			});

			it('should pass it\'s argument to every callback', function() {
				var arg = {};
				sut.promise.then(spy);
				sut.resolve(arg);
				clock.tick(1);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should do it even if #promise.then() is invoked after #resolve', function() {
				var arg = {};
				sut.resolve(arg);
				sut.promise.then(spy);
				clock.tick(1);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should be idempotent', function() {
				sut.promise.then(spy);
				sut.resolve();
				clock.tick(1);
				sut.resolve();
				clock.tick(1);
				assert.ok(spy.calledOnce);
			});
		});

		describe('#reject method', function() {
			it('should be a function', function() {
				assert.equal(typeof sut.reject, 'function');
			});

			var clock, spy;
			beforeEach(function() {
				clock = sinon.useFakeTimers();
				spy = sinon.spy();
			});

			afterEach(function() {
				clock.restore();
			});

			it('should change promise status to "failed"', function() {
				sut.reject();
				assert.equal(sut.promise.status, 'failed');
			});

			it('should invoke all functions second arguments passed to #promise.then() when called on the next event loop', function() {
				sut.promise.then(null, spy);
				sut.reject();
				clock.tick(1);
				assert.ok(spy.calledOnce);
			});

			it('should pass it\'s argument to every callback', function() {
				var arg = {};
				sut.promise.then(null, spy);
				sut.reject(arg);
				clock.tick(1);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should do it even if #promise.then() is invoked after #reject', function() {
				var arg = {};
				sut.reject(arg);
				sut.promise.then(null, spy);
				clock.tick(1);
				assert.ok(spy.calledWithExactly(arg));
			});
		});
	});


	describe('#isPromise function', function() {
		it('should return true when a object with #then() is passed', function() {
			assert.ok(deferred.isPromise({ then: function() { } }));
		});

		it('should fail with a simple object', function() {
			assert.ok(!deferred.isPromise({}));
		});
	});

});
