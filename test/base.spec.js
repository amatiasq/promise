//jshint maxlen:200
'use strict';

var sinon = require('sinon');
var assert = require('assert');

module.exports = function(deferred) {

	function testImplementation(deferred) {
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
						second.then(spy);
						sut.resolve();
						clock.tick(10);
						assert.equal(second.status, 'fulfilled');
						assert.ok(spy.calledWithExactly(value));
					});

					it('should be resolved with the value returned by the error callback', function() {
						var second = prom.then(null, function() { return value });
						second.then(spy);
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

					it('should keep returning a promise even after the owner promise is completed', function() {
						sut.resolve('hola');
						var value = 'pepe';
						var second = prom.then(function() { return value });
						second.then(spy);
						clock.tick(10);
						assert.equal(second.status, 'fulfilled');
						assert.ok(spy.calledWithExactly(value));
					});
				});
			});


			function testAction(action, status) {
				var isResolve = action === 'resolve';
				var opposite = isResolve ? 'reject' : 'resolve';

				function invokeThen(promise, callback, revert) {
					if ((!revert && isResolve) || (revert && !isResolve))
						return promise.then(callback);
					else
						return promise.then(null, callback);
				}

				it('should be a function', function() {
					assert.equal(typeof sut[action], 'function');
				});

				var clock, spy;
				beforeEach(function() {
					clock = sinon.useFakeTimers();
					spy = sinon.spy();
				});

				afterEach(function() {
					clock.restore();
				});

				it('should change promise status to "' + status + '"', function() {
					sut[action]();
					assert.equal(sut.promise.status, status);
				});

				it('should invoke all functions ' + (isResolve ? 'first' : 'second') + ' argument passed to #promise.then() when called on the next event loop', function() {
					invokeThen(sut.promise, spy);
					sut[action]();
					clock.tick(10);
					assert.ok(spy.calledOnce);
				});

				it('should pass it\'s argument to every callback', function() {
					var arg = {};
					invokeThen(sut.promise, spy);
					sut[action](arg);
					clock.tick(10);
					assert.ok(spy.calledWithExactly(arg));
				});

				it('should do it even if #promise.then() is invoked after #' + action + ' but not on the same event loop', function() {
					var arg = {};
					sut[action](arg);
					invokeThen(sut.promise, spy);
					assert.ok(!spy.called);
					clock.tick(10);
					assert.ok(spy.calledWithExactly(arg));
				});

				it('should be idempotent', function() {
					invokeThen(sut.promise, spy);
					sut[action]();
					clock.tick(10);
					sut[action]();
					clock.tick(10);
					assert.ok(spy.calledOnce);
				});

				it('should not call the ' + (isResolve ? 'error' : 'success') + ' callback', function() {
					invokeThen(sut.promise, spy, true);
					sut[action]();
					clock.tick(10);
					assert.ok(!spy.calledOnce);
				});

				it('#' + opposite + ' should have no effect after a #' + action + ' call', function() {
					invokeThen(sut.promise, spy, true);
					sut[action]();
					sut[opposite]();
					clock.tick(10);
					assert.ok(!spy.calledOnce);
					assert.equal(sut.promise.status, status);
				});
			}


			describe('#resolve method', function() {
				return testAction('resolve', 'fulfilled');
			});

			describe('#reject method', function() {
				return testAction('reject', 'failed');
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

			describe('when it recives a promise', function() {
				it('should return a new promise to be resolved when the value is resolved', function() {
					var def = deferred();
					invoke(def, def.promise, 'resolve');
				});

				it('should return a new promise to be rejected when the value is rejected', function() {
					var def = deferred();
					invoke(def, def.promise, 'reject');
				});
			});

			describe('when it recives a deferred', function() {
				it('should return a new promise to be resolved when the value is resolved', function() {
					var def = deferred();
					invoke(def, def, 'resolve');
				});

				it('should return a new promise to be rejected when the value is rejected', function() {
					var def = deferred();
					invoke(def, def, 'reject');
				});
			});

			describe('callback arguments', function() {
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


	describe('Base deferred component', function() {
		testImplementation(deferred);
	});


	describe('Deferred extensibility', function() {
		it('should provide a #extend method', function() {
			assert.equal(typeof deferred.extend, 'function');
		});

		it('should return a new deferred creator', function() {
			var newDef = deferred.extend();

			assert.equal(typeof newDef, 'function');
			assert.ok(newDef.isDeferred(newDef()));
			assert.ok(newDef.isPromise(newDef().promise));
		});

		describe('the new deferred should pass every previous test', function() {
			testImplementation(deferred.extend());
		});

		it('should add the properties of the first argument to every promise created with the new factory', function() {
			var value1 = 1;
			var value2 = 'pepe';
			var sut = deferred.extend({
				a: value1,
				pepe: function() { return value2 },
			});

			var prom = sut().promise;
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
			var sut = deferred.extend(null, {
				a: value1,
				pepe: function() { return value2 },
			});

			var def = sut();
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
};
