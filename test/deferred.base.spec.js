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

			describe('#then method return value', function() {
				var clock, spy, value;
				beforeEach(function() {
					clock = sinon.useFakeTimers();
					spy = sinon.spy();
					value = {};
				});

				afterEach(function() {
					clock.restore();
				});

				it('should be a new promise', function() {
					assert.ok(deferred.isPromise(prom.then()));
					assert.notEqual(prom.then(), prom);
				});

				it('should be resolved with the value returned by the success callback', function() {
					var second = prom.then(function() { return value });
					second.then(spy, null);
					sut.resolve();
					clock.tick(10);
					assert.equal(second.status, 'fulfilled');
					assert.ok(spy.calledWithExactly(value));
				});

				it('should be resolved with the value returned by the error callback', function() {
					var second = prom.then(null, function() { return value });
					second.then(spy, null);
					sut.reject();
					clock.tick(10);
					assert.equal(second.status, 'fulfilled');
					assert.ok(spy.calledWithExactly(value));
				});

				it('should be rejected if the success callback throws an error with this error as the reason', function() {
					var second = prom.then(function() { throw value });
					second.then(null, spy);
					sut.resolve();
					clock.tick(10);
					assert.equal(second.status, 'failed');
					assert.ok(spy.calledWithExactly(value));
				});

				it('should be rejected if the error callback throws an error with this error as the reason', function() {
					var second = prom.then(null, function() { throw value });
					second.then(null, spy);
					sut.reject();
					clock.tick(10);
					assert.equal(second.status, 'failed');
					assert.ok(spy.calledWithExactly(value));
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
				clock.tick(10);
				assert.ok(spy.calledOnce);
			});

			it('should pass it\'s argument to every callback', function() {
				var arg = {};
				sut.promise.then(spy);
				sut.resolve(arg);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should do it even if #promise.then() is invoked after #resolve', function() {
				var arg = {};
				sut.resolve(arg);
				sut.promise.then(spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should be idempotent', function() {
				sut.promise.then(spy);
				sut.resolve();
				clock.tick(10);
				sut.resolve();
				clock.tick(10);
				assert.ok(spy.calledOnce);
			});

			it('should not call the error callback', function() {
				sut.promise.then(null, spy);
				sut.resolve();
				clock.tick(10);
				assert.ok(!spy.calledOnce);
			});

			it('#reject should have no effect after a #resolve call', function() {
				sut.promise.then(null, spy);
				sut.resolve();
				sut.reject();
				clock.tick(10);
				assert.ok(!spy.calledOnce);
				assert.equal(sut.promise.status, 'fulfilled');
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
				clock.tick(10);
				assert.ok(spy.calledOnce);
			});

			it('should pass it\'s argument to every callback', function() {
				var arg = {};
				sut.promise.then(null, spy);
				sut.reject(arg);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should do it even if #promise.then() is invoked after #reject', function() {
				var arg = {};
				sut.reject(arg);
				sut.promise.then(null, spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should be idempotent', function() {
				sut.promise.then(spy);
				sut.resolve();
				clock.tick(10);
				sut.resolve();
				clock.tick(10);
				assert.ok(spy.calledOnce);
			});

			it('should not call the normal callback', function() {
				sut.promise.then(spy);
				sut.reject();
				clock.tick(10);
				assert.ok(!spy.calledOnce);
			});

			it('#resolve should have no effect after a #reject call', function() {
				sut.promise.then(spy);
				sut.reject();
				sut.resolve();
				clock.tick(10);
				assert.ok(!spy.calledOnce);
				assert.equal(sut.promise.status, 'failed');
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

	describe('#when method', function() {
		var clock, spy;
		beforeEach(function() {
			clock = sinon.useFakeTimers();
			spy = sinon.spy();
		});

		afterEach(function() {
			clock.restore();
		});

		describe('when it recives a non-promise', function() {
			it('should return a promsie fulfilled with the value', function() {
				var value = 'pepe';
				var prom = deferred.when(value);
				assert.ok(deferred.isPromise(prom));
				prom.then(spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(value));
			});
		});

		describe('when it recives a promise', function() {
			it('should return a new promise to be resolved when the value is resolved', function() {
				var arg = 'pepe';
				var def = deferred();
				var prom = deferred.when(def.promise);
				assert.equal(prom.status, 'unfulfilled');
				def.resolve(arg);
				clock.tick(10);
				assert.equal(prom.status, 'fulfilled');
				prom.then(spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should return a new promise to be rejected when the value is rejected', function() {
				var arg = 'pepe';
				var def = deferred();
				var prom = deferred.when(def.promise);
				assert.equal(prom.status, 'unfulfilled');
				def.reject(arg);
				clock.tick(10);
				assert.equal(prom.status, 'failed');
				prom.then(null, spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});
		});

		describe('when it recives a deferred', function() {
			it('should return a new promise to be resolved when the value is resolved', function() {
				var arg = 'pepe';
				var def = deferred();
				var prom = deferred.when(def);
				assert.equal(prom.status, 'unfulfilled');
				def.resolve(arg);
				clock.tick(10);
				assert.equal(prom.status, 'fulfilled');
				prom.then(spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});

			it('should return a new promise to be rejected when the value is rejected', function() {
				var arg = 'pepe';
				var def = deferred();
				var prom = deferred.when(def);
				assert.equal(prom.status, 'unfulfilled');
				def.reject(arg);
				clock.tick(10);
				assert.equal(prom.status, 'failed');
				prom.then(null, spy);
				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			});
		});
	});
});
