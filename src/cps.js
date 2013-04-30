'use strict';

var simple = require('./simple');

module.exports = simple.extend({

}, {

	callback: function() {
		var self = this;

		return function(err, value) {
			if (err)
				self.reject(err);
			else
				self.resolve(value);
		};
	}

});
