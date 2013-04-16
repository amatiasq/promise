var factory = require('../../src/base');

exports.World = function(done) {
	this.factory = factory;
	done(this);
};

exports.sync = function(target) {
	var Given = target.Given;
	var When = target.When;
	var Then = target.Then;
	var Before = target.Before;
	var After = target.After;

	function wrap(fn) {
		return function() {
			var args = Array.prototype.slice.call(arguments);
			var end = args.pop();
			fn.apply(this, args);
			end();
		};
	}

	target.Given = function(pattern, action) {
		Given.call(target, pattern, wrap(action));
	};

	target.When = function(pattern, action) {
		When.call(target, pattern, wrap(action));
	};

	target.Then = function(pattern, action) {
		Then.call(target, pattern, wrap(action));
	};

	target.Before = function(action) {
		Before.call(target, wrap(action));
	};

	target.After = function(action) {
		After.call(target, wrap(action));
	};
};
