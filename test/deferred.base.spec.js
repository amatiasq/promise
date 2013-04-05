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

	var sut;
	beforeEach(function() {
		sut = deferred();
	});

	describe('promise property', function() {
		it('should return true when passed to deferred.isPromise()', function(){
			assert.ok(deferred.isPromise(sut.promise));
		});

		it('should have a ".then()" method', function() {

		});
	});


	it('should have a "promise" property', function() {
		assert.ok('promise' in sut);
	});
});
