module.exports = function() {

	var assert = require('assert');
	var sinon = require('sinon');

	var sup = require('../support/base');
	sup.sync(this);

	this.World = sup.World;
	var sampleValue = 'pepe';
	var otherValue = 'hola';

	var clock, spy;
	this.Before(function() {
		clock = sinon.useFakeTimers();
		spy = sinon.spy();

		spy.firstArg = function() {
			return this.firstCall.args[0]
		};
	});
	this.After(function() {
		clock.restore();
	});

	this.Given(/^I create a deferred object$/, function() {
		this.def = this.factory();
	});

	this.Given(/^I add a success callback$/, function() {
		this.def.promise.then(spy);
	});

	this.Given(/^I add a error callback$/, function(callback) {
		this.def.promise.then(null, spy);
	});

	this.Given(/^The callback is not called$/, function() {
		assert.ok(!spy.called);
	});

	this.Given(/^I resolve the promise with some sample value$/, function() {
		this.def.resolve(sampleValue);
	});

	this.Given(/^I reject the promise with some sample value$/, function() {
		this.def.reject(sampleValue);
	});

	this.Given(/^I add a (success|error) listener than (returns|throws) other value$/, function(type, action) {
		function callback() {
			if (action === 'returns')
				return otherValue;
			else
				throw otherValue;
		}

		this.second = type === 'success' ? this.def.promise.then(callback) : this.def.promise.then(null, callback) ;
	});

	this.When(/^I (reject|resolve) the promise without value$/, function(method) {
		this.def[method]();
	});

	this.When(/^The next event loop ticks$/, function() {
		clock.tick(10);
	});



	this.Then(/^The callback must be called( once)?$/, function(once) {
		assert.ok(once ? spy.calledOnce : spy.called);
	});

	this.Then(/^I should see "(\w+)" as the promise status$/, function(status) {
		assert.equal(this.def.promise.status, status);
	});

	this.Then(/^The callback must receive the sample value$/, function() {
		assert.equal(spy.firstArg(), sampleValue);
	});

	this.Then(/^The returned promise must be resolved with the value returned by the callback$/, function() {
		this.second.then(spy);
		clock.tick(10);
		assert.equal(spy.firstArg(), otherValue);
	});

	this.Then(/^The returned promise must be rejected with the value throwed by the callback$/, function(callback) {
		this.second.then(null, spy);
		clock.tick(10);
		assert.equal(spy.firstArg(), otherValue);
	});


};
