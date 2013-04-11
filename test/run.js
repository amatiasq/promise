//jshint unused:false
'use strict';

var base = require('../src/base');
var baseTest = require('./base.spec');

var simple = require('../src/simple');
var simpleTest = require('./simple.spec');

describe('Basic promise implementation', function() {
	baseTest(base);
});

describe('Simple promise implementation', function() {
	simpleTest(simple);
});
