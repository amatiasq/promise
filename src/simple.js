'use strict';

var base = require('./base');

module.exports = base.extend({

	isResolved: function() {
		return this.status === 'fulfilled';
	},

	isRejected: function() {
		return this.status === 'failed';
	},

	isCompleted: function() {
		return this.status !== 'unfulfilled';
	},

});
