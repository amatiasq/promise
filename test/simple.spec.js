//jshint maxlen:200, unused:false
'use strict';

var sinon = require('sinon');
var assert = require('assert');
var baseTest = require('./base.spec');

module.exports = function(deferred) {
	baseTest(deferred);

	describe('on promises object', function() {

		var value = 'pepe';
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

		describe('when #fin is invoked', function() {
			var clock, spy;
			beforeEach(function() {
				clock = sinon.useFakeTimers();
				spy = sinon.spy();
			});
			afterEach(function() {
				clock.restore();
			});

			function testFin(action, status) {

				it('should invoke the callback', function() {
					def.promise.fin(spy);
					def[action]();
					clock.tick(10);
					assert.ok(spy.called);
				});

				describe('the returned promise', function() {
					it('should be ' + status + ' when the value returned by the callback is available', function() {
						var other = deferred();
						var second = def.promise.fin(function() { return other.promise });
						def[action]();
						clock.tick(10);
						assert.ok(!second.isCompleted(), 'second was completed before callback return value is available');
						other[action]();
						clock.tick(10);
						assert.ok(second.isCompleted(), 'second was not completed after callback return value is available');
					});

					it('should be ' + status + ' with the original value', function() {
						var otherValue = 'hola';
						var second = def.promise.fin(function() { return otherValue });

						if (action === 'resolve')
							second.then(spy);
						else
							second.then(null, spy);

						def[action](value);
						clock.tick(10);
						assert.ok(spy.called, 'the callback was not invoked');
						assert.ok(spy.calledWithExactly(value), 'the promise\'s value has been modified');
					});

					it('should be rejected if the callback throws an error with this error as the reason', function() {
						var second = def.promise.fin(function() { throw value });
						second.then(null, spy);
						def[action]();
						clock.tick(10);
						assert.ok(spy.called, 'the callback was not invoked');
						assert.ok(spy.calledWithExactly(value), 'the promise\'s value has been modified');
					});
				});
			}

			describe('and the promise succeeds', function() {
				testFin('resolve', 'fulfilled');
			});

			describe('and the promise fails', function() {
				testFin('reject', 'rejected');
			});
		});
	});

	describe('on factory function', function() {
		describe('when #resolved function is invoked', function() {
			it('should return a fulfilled promise', function() {
				var prom = deferred.resolved();
				assert.ok(deferred.isPromise(prom), 'returned value is not a promise');
				assert.ok(prom.isResolved(), 'promise is not fulfilled');
			});

			it('should return a promise fulfilled with the recived value', function() {
				var value = 'pepe';
				var clock = sinon.useFakeTimers();
				var spy = sinon.spy();
				var prom = deferred.resolved(value);
				prom.then(spy);
				clock.tick(10);
				assert.ok(spy.called, 'the callback was not invoked');
				assert.ok(spy.calledWithExactly(value), 'promise was not fulfilled with the value');
				clock.restore();
			});
		});

		describe('when #rejected function is invoked', function() {
			it('should return a rejected promise', function() {
				var prom = deferred.rejected();
				assert.ok(deferred.isPromise(prom), 'returned value is not a promise');
				assert.ok(prom.isRejected(), 'promise is not rejected');
			});

			it('should return a promise rejected with the recived value as the reason', function() {
				var value = 'pepe';
				var clock = sinon.useFakeTimers();
				var spy = sinon.spy();
				var prom = deferred.rejected(value);
				prom.then(null, spy);
				clock.tick(10);
				assert.ok(spy.called, 'the callback was not invoked');
				assert.ok(spy.calledWithExactly(value), 'promise was not rejected with the value');
				clock.restore();
			});
		});

		describe('when #all function is invoked', function() {

			// function testNoArgs() { }
			// function testPromises() { }
			// function testMixed() { }

			describe('without arguments', function() {
				it('should return a promise resolved with an empty array', function() {
					var clock = sinon.useFakeTimers();
					var spy = sinon.spy();
					var result = deferred.all();
					assert.ok(deferred.isPromise(result), 'returned value is not a promise');
					result.then(spy);
					clock.tick(10);
					assert.ok(spy.calledWith([]));
				});
			});
			describe('with a array of promises', function() {
				describe('if any promise fails', function() {
					it('should reject the returned promise with the recived error as the reason');
				});
				describe('if all promises succeed', function() {
					it('should resolve the returned promise with an array of the promises values sorted as they were recived');
				});
			});
			describe('with a array of mixed promises and other values', function() {
				describe('if any promise fails', function() {
					it('should reject the returned promise with the recived error as the reason');
				});
				describe('if all promises succeed', function() {
					it('should resolve the returned promise with an array of the promises values and recived values sorted as they were recived');
				});
			});


			describe('with a empty array', function() {
				it('should return a promise resolved with an empty array');
			});
			describe('with promises as arguments', function() {
				describe('if any promise fails', function() {
					it('should reject the returned promise with the recived error as the reason');
				});
				describe('if all promises succeed', function() {
					it('should resolve the returned promise with an array of the promises values sorted as they were recived');
				});

			});
			describe('with mixed promises and other values as arguments', function() {
				describe('if any promise fails', function() {
					it('should reject the returned promise with the recived error as the reason');
				});
				describe('if all promises succeed', function() {
					it('should resolve the returned promise with an array of the promises values and recived values sorted as they were recived');
				});
			});
		});
	});
};
