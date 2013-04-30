//jshint maxlen:200, unused: false
'use strict';

var sinon = require('sinon');
var assert = require('assert');
var simpleTest = require('./simple.spec');

module.exports = function(deferred) {
	simpleTest(deferred);

	describe('when callback method is invoked', function() {
		var value = 'pepe';
		var def, prom, spy, clock;

		beforeEach(function() {
			spy = sinon.spy();
			clock = sinon.useFakeTimers();
			def = deferred();
			prom = def.promise;
		});
		afterEach(function() {
			clock.restore();
		});

		describe('without arguments', function() {
			var callback;

			beforeEach(function() {
				callback = def.callback();
			});

			it('should return a function', function() {
				assert.ok(typeof callback === 'function');
			});

			describe('the returned function', function() {

				describe('when invoked without arguments', function() {
					it('should fullfill the promise', function() {
						assert.ok(!prom.isResolved(), 'promise was resolved before execution');
						callback();
						assert.ok(prom.isResolved(), 'promise is not resolved');
					});
				});

				describe('when invoked with a truthy argument', function() {
					it('should reject the promise with this argument as the reason', function() {
						assert.ok(!prom.isRejected(), 'promise was rejected before execution');
						prom.then(null, spy);

						callback(value);
						clock.tick(10);

						assert.ok(spy.called, 'callback was not called');
						assert.ok(spy.calledWithExactly(value), 'the value was not passed to the callback');
					});
				});

				describe('when invoked with two arguments', function() {
					describe('and the first argument falsy', function() {
						it('should resolve the promise with the second argument as the value', function() {
							prom.then(spy);
							callback(null, value);
							clock.tick(10);

							assert.ok(spy.called, 'callback was not called');
							assert.ok(spy.calledWithExactly(value), 'the value was not passed to the callback');
						});
					});
				});
			});
		});
	});

	describe('when static adapt method is invoked', function() {
		it('should return a new object with the same interface as the object recived by argument', function() {
			var original = {
				a: 1,
				b: 'hola',
				d: {},
				c: function() { }
			};

			var wrapper = deferred.adapt(original);

			Object.keys(original).forEach(function(prop) {
				assert.ok(typeof original[prop] === typeof wrapper[prop]);
			});
		});

		it('should wrap even inherited properties', function() {
			var value = 'cosa';
			var wrapper = deferred.adapt(Object.create({ sample: value }));
			assert.equal(wrapper.sample, value);
		});

		describe('when a method is invoked on it\'s result', function() {

			describe('without argument', function() {
				it('should call the original object\'s function adding a function argument', function() {
					var spy = sinon.spy();
					var original = { a: spy };
					var wrapper = deferred.adapt(original);

					assert.ok(!spy.called, 'original function was called before wrapper was invoked');
					wrapper.a();
					assert.ok(spy.called, 'original function was not called');
					assert.ok(typeof spy.lastCall.args[0] === 'function', 'original function did not recive the argument');
				});
			});

			describe('with arguments', function() {
				it('should call the original object\'s function adding a extra function argument', function() {
					var arg1 = 'pepe';
					var arg2 = 42;
					var spy = sinon.spy();
					var original = { a: spy };
					var wrapper = deferred.adapt(original);

					assert.ok(!spy.called, 'original function was called before wrapper was invoked');
					wrapper.a(arg1, arg2);
					assert.ok(spy.called, 'original function was not called');
					assert.ok(spy.lastCall.args[0] === arg1 && spy.lastCall.args[1] === arg2, 'arguments are not passed');
					assert.ok(typeof spy.lastCall.args[2] === 'function', 'original function did not recive the extra argument');
				});
			});
		});
	});

	describe('when promise\'s adapt method is invoked', function() {
		it('should invoke static adapt method passing promise\'s result', function() {
			var value = {};
			var mock = sinon.mock(deferred);
			var clock = sinon.useFakeTimers();
			mock.expects('adapt').withExactArgs(value);

			var def = deferred();
			def.promise.adapt();
			def.resolve(value);
			clock.tick(10);

			mock.verify();
			mock.restore();
			clock.restore();
		});
	});
};
