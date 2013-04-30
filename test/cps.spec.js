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
						assert.ok(!prom.isResolved());
						callback();
						assert.ok(prom.isResolved());
					});
				});

				describe('when invoked with a truthy argument', function() {
					it('should reject the promise with this argument as the reason', function() {
						assert.ok(!prom.isRejected());
						prom.then(null, spy);

						callback(value);
						clock.tick(10);

						assert.ok(spy.called);
						assert.ok(spy.calledWithExactly(value));
					});
				});

				describe('when invoked with two arguments', function() {
					describe('and the first argument falsy', function() {
						it('should resolve the promise with the second argument as the value', function() {
							prom.then(spy);
							callback(null, value);
							clock.tick(10);

							assert.ok(spy.called);
							assert.ok(spy.calledWithExactly(value));
						});
					});
				});
			});
		});
	});

	describe('when static adapt method is invoked', function() {

	});
};
