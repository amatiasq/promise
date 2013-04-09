'use strict';

//var sinon = require('sinon');
var assert = require('assert');
var deferred = require('../src/deferred.base');

describe('Deferred', function() {

	it('module should be a callable function', function() {
		assert.equal(typeof deferred, 'function');
	});
	it('module return value should be thruthy', function() {
		assert.ok(deferred());
	});

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


	describe('#isPromise function', function() {
		it('should return true when a object with #then() is passed', function() {
			assert.ok(deferred.isPromise({ then: function() { } }));
		});

		it('should fail with a simple object', function() {
			assert.ok(!deferred.isPromise({}));
		});
	});

});
