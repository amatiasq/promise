//jshint maxlen:200
'use strict';

var sinon = require('sinon');
var assert = require('assert');

module.exports = function(deferred) {

	function testImplementation(deferred) {

		var def;
		beforeEach(function() {
			def = deferred();
		});
		it('module return value should be thruthy', function() {
			assert.ok(deferred());
		});

		describe('a deferred object\'s', function() {
			describe('#promise property', function() {
				var prom;
				beforeEach(function() {
					prom = def.promise;
				});

				it('should exist', function() {
					assert.ok('promise' in def);
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

				describe('when #then method is invoked', function() {
					var value = 'pepe';
					var clock, spy, prom;
					beforeEach(function() {
						clock = sinon.useFakeTimers();
						spy = sinon.spy();

						prom = def.promise;
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
						second.then(spy);
						def.resolve();
						clock.tick(10);
						assert.equal(second.status, 'fulfilled');
						assert.ok(spy.calledWithExactly(value));
					});

					it('should be resolved with the value returned by the error callback', function() {
						var second = prom.then(null, function() { return value });
						second.then(spy);
						def.reject();
						clock.tick(10);
						assert.equal(second.status, 'fulfilled');
						assert.ok(spy.calledWithExactly(value));
					});

					it('should be rejected if the success callback throws an error with this error as the reason', function() {
						var second = prom.then(function() { throw value });
						second.then(null, spy);
						def.resolve();
						clock.tick(10);
						assert.equal(second.status, 'failed');
						assert.ok(spy.calledWithExactly(value));
					});

					function testCallback(action, operation) {
						function check(prom, status) {
							clock.tick(10);
							assert.equal(prom.status, status);
							assert.ok(spy.calledWithExactly(value));
						}

						describe('and the callback returns a value', function() {
							it('should be resolved with this value', function() {
								var second = operation(prom, function() { return value });
								second.then(spy);
								def[action]();
								check(second, 'fulfilled');
							});
						});

						describe('and the callback throws an error', function() {
							it('should be rejected with this error as the reason', function() {
								var second = operation(prom, function() { throw value });
								second.then(null, spy);
								def[action]();
								check(second, 'failed');
							});
						});

						describe('and a callback is added after', function() {
							describe('and the callback returns a value', function() {
								it('should be resolved with this value on the next event loop', function() {
									var second = operation(prom, function() { return value });
									def[action]();
									second.then(spy);
									assert.ok(!spy.called, 'it was called on the same event loop');
									check(second, 'fulfilled');
								});
							});

							describe('and the callback throws an error', function() {
								it('should be rejected with this error as the reason on the next event loop', function() {
									var second = operation(prom, function() { throw value });
									def[action]();
									second.then(null, spy);
									assert.ok(!spy.called, 'callback was called on the same event loop');
									check(second, 'failed');
								});
							});
						});
					}

					describe('without arguments the returned promise', function() {
						function testThenEmptyCall(status, delegate) {
							var value = 'pepe';
							var second = prom.then();
							delegate(second, value);
							clock.tick(10);
							assert.equal(second.status, status, 'promise was not completed');
							assert.ok(spy.called, 'promise did not call the callback');
							assert.ok(spy.calledWithExactly(value), 'promise was not completed with the value');
						}

						it('must success if the original promise succeed', function() {
							testThenEmptyCall('fulfilled', function(prom, value) {
								prom.then(spy);
								def.resolve(value);
							});
						});

						it('must fail if the original promise fails', function() {
							testThenEmptyCall('failed', function(prom, value) {
								prom.then(null, spy);
								def.reject(value);
							});
						});

						it('must be completed even if the promise was completed before #then() was called', function() {
							testThenEmptyCall('fulfilled', function(prom, value) {
								def.resolve(value);
								prom.then(spy);
								assert.ok(!spy.called, 'promise invoked the callback on the same loop');
							});
						});
					});

					describe('the returned promise', function() {
						describe('when the original promise is resolved', function() {
							testCallback('resolve', function(promise, callback) {
								return promise.then(callback);
							});
						});

						describe('when the original promise is rejected', function() {
							testCallback('reject', function(promise, callback) {
								return promise.then(null, callback);
							});
						});
					});
				});

				function testAction(action) {
					var isResolve = action === 'resolve';
					var opposite = isResolve ? 'reject' : 'resolve';
					var status = isResolve ? 'fulfilled' : 'failed';

					function invokeThen(promise, callback, revert) {
						if ((!revert && isResolve) || (revert && !isResolve))
							return promise.then(callback);
						else
							return promise.then(null, callback);
					}

					var clock, spy;
					beforeEach(function() {
						clock = sinon.useFakeTimers();
						spy = sinon.spy();
					});


					it('should change promise status to "' + status + '"', function() {
						def[action]();
						assert.equal(def.promise.status, status);
					});

					it('should invoke all functions ' + (isResolve ? 'first' : 'second') + ' argument passed to #promise.then() when called on the next event loop', function() {
						invokeThen(def.promise, spy);
						def[action]();
						clock.tick(10);
						assert.ok(spy.calledOnce);
					});

					it('should pass it\'s argument to every callback', function() {
						var arg = {};
						invokeThen(def.promise, spy);
						def[action](arg);
						clock.tick(10);
						assert.ok(spy.calledWithExactly(arg));
					});

					it('should not call the ' + (isResolve ? 'error' : 'success') + ' callback', function() {
						invokeThen(def.promise, spy, true);
						def[action]();
						clock.tick(10);
						assert.ok(!spy.calledOnce);
					});

					describe('before #promise.then', function() {
						it('should pass it\'s argument to every callback on the next event loop', function() {
							var arg = {};
							def[action](arg);
							invokeThen(def.promise, spy);
							assert.ok(!spy.called, 'callback was called on the same event loop');
							clock.tick(10);
							assert.ok(spy.calledWithExactly(arg), 'callback didn\'t recived the value');
						});
					});

					describe('more than once', function() {
						it('should be idempotent', function() {
							invokeThen(def.promise, spy);
							def[action]();
							clock.tick(10);
							def[action]();
							clock.tick(10);
							assert.ok(spy.calledOnce);
						});
					});

					describe('#' + opposite, function() {
						it('should have no effect', function() {
							invokeThen(def.promise, spy, true);
							def[action]();
							def[opposite]();
							clock.tick(10);
							assert.ok(!spy.calledOnce);
							assert.equal(def.promise.status, status);
						});
					});
				}


				describe('when #resolve method is invoked', function() {
					return testAction('resolve');
				});

				describe('when #reject method is invoked', function() {
					return testAction('reject');
				});
			});
		});


		describe('when #isPromise function is invoked', function() {
			it('should return true if a object with #then() is passed as argument', function() {
				assert.ok(deferred.isPromise({ then: function() { } }));
			});

			it('should fail with a simple object', function() {
				assert.ok(!deferred.isPromise({}));
			});
		});

		describe('when #when method is invoked', function() {
			var clock, spy;
			beforeEach(function() {
				clock = sinon.useFakeTimers();
				spy = sinon.spy();
			});

			afterEach(function() {
				clock.restore();
			});

			describe('and it recives a non-promise', function() {
				it('should return a promsie fulfilled with the value', function() {
					var value = 'pepe';
					var prom = deferred.when(value);
					assert.ok(deferred.isPromise(prom), 'returned value is not a promise');
					prom.then(spy);
					clock.tick(10);
					assert.ok(spy.calledOnce, 'callback was not called');
					assert.ok(spy.calledWithExactly(value), 'the promise does not have the expected value');
				});
			});

			function invoke(def, value, action) {
				var arg = 'pepe';
				var status = action === 'resolve' ? 'fulfilled' : 'failed';
				var prom = deferred.when(value);
				assert.equal(prom.status, 'unfulfilled');
				def[action](arg);
				clock.tick(10);
				assert.equal(prom.status, status);

				if (action === 'resolve')
					prom.then(spy);
				else
					prom.then(null, spy);

				clock.tick(10);
				assert.ok(spy.calledWithExactly(arg));
			}

			describe('if it recives a promise', function() {
				it('should return a new promise to be resolved when the value is resolved', function() {
					var def = deferred();
					invoke(def, def.promise, 'resolve');
				});

				it('should return a new promise to be rejected when the value is rejected', function() {
					var def = deferred();
					invoke(def, def.promise, 'reject');
				});
			});

			describe('if it recives a deferred', function() {
				it('should return a new promise to be resolved when the value is resolved', function() {
					var def = deferred();
					invoke(def, def, 'resolve');
				});

				it('should return a new promise to be rejected when the value is rejected', function() {
					var def = deferred();
					invoke(def, def, 'reject');
				});
			});

			describe('and it recives callback arguments', function() {
				it('should invoke success callback as soon as the value is available but at least on the next event loop', function() {
					var prom = deferred.when('hola', function() { return 'pepe' });
					prom.then(spy);
					assert.ok(!spy.called);
					clock.tick(10);
					assert.equal(prom.status, 'fulfilled');
					assert.ok(spy.calledWithExactly('pepe'));
				});

				it('should invoke error callback if the value is a rejected promise', function() {
					var def = deferred();
					var prom = deferred.when(def.promise, null, function() { throw 'pepe' });
					def.reject();
					prom.then(null, spy);
					assert.ok(!spy.called);
					clock.tick(10);
					assert.equal(prom.status, 'failed');
					assert.ok(spy.calledWithExactly('pepe'));
				});
			});
		});
	}

	describe('In order to be extensible', function() {
		it('should provide a #extend method', function() {
			assert.equal(typeof deferred.extend, 'function');
		});

		describe('when #extend method is invoked', function() {
			it('should return a new deferred factory', function() {
				var newDef = deferred.extend();

				assert.equal(typeof newDef, 'function', 'new factory is not a function');
				assert.ok(newDef.isDeferred(newDef()), 'new factory\'s return value is not considered a deferred');
				assert.ok(newDef.isPromise(newDef().promise), 'new factory\'s return value\'s promise property is not considered a promise');
			});

			describe('the new deferred should pass every previous test', function() {
				testImplementation(deferred.extend());
			});

			it('should add the properties of the first argument to every promise created with the new factory', function() {
				var value1 = 1;
				var value2 = 'pepe';
				var factory = deferred.extend({
					a: value1,
					pepe: function() { return value2 },
				});

				var prom = factory().promise;
				assert.equal(prom.a, value1);
				assert.equal(prom.pepe(), value2);
			});

			it('should not modify the original promise when I add methods to the new one', function() {
				deferred.extend({
					test: function() { }
				});

				var prom = deferred().promise;
				assert.ok(!prom.test);
			});

			it('should add the properties of the second argument to every deferred created with the new factory', function() {
				var value1 = 1;
				var value2 = 'pepe';
				var factory = deferred.extend(null, {
					a: value1,
					pepe: function() { return value2 },
				});

				var def = factory();
				assert.equal(def.a, value1);
				assert.equal(def.pepe(), value2);
			});

			it('should not modify the original promise when I add methods to the new one', function() {
				deferred.extend(null, {
					test: function() { }
				});

				var def = deferred();
				assert.ok(!def.test);
			});
		});
	});

	testImplementation(deferred);

};
