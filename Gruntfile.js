module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    requirejs: {
      baseMin: {
        options: {
          baseUrl: 'src.requirejs',
          name: 'base',
          out: 'build/base.min.js',
          wrap: {
            startFile: 'build/wrap.start',
            endFile: 'build/wrap.end'
          }
        }
      },
      base: {
        options: {
          baseUrl: 'src.requirejs',
          name: 'base',
          optimize: 'none',
          out: 'build/base.js',
          wrap: {
            startFile: 'build/wrap.start',
            endFile: 'build/wrap.end'
          }
        }
      },
      simpleMin: {
        options: {
          baseUrl: 'src.requirejs',
          name: 'simple',
          out: 'build/simple.min.js',
          wrap: {
            startFile: 'build/wrap.start',
            endFile: 'build/wrap.end'
          }
        }
      },
      simple: {
        options: {
          baseUrl: 'src.requirejs',
          name: 'simple',
          optimize: 'none',
          out: 'build/simple.js',
          wrap: {
            startFile: 'build/wrap.start',
            endFile: 'build/wrap.end'
          }
        }
      }
    },

    jshint: {
      options: {
        "maxerr"        : 50,       // {int} Maximum error before stopping

        // Enforcing
        "bitwise"       : true,     // true: Prohibit bitwise operators (&, |, ^, etc.)
        "camelcase"     : true,     // true: Identifiers must be in camelCase
        "curly"         : false,    // true: Require {} for every new block or scope
        "eqeqeq"        : true,     // true: Require triple equals (===) for comparison
        "forin"         : true,     // true: Require filtering for..in loops with obj.hasOwnProperty()
        "immed"         : false,    // true: Require immediate invocations to be wrapped in parens e.g. `(function () { } ());`
        "indent"        : 4,        // {int} Number of spaces to use for indentation
        "latedef"       : true,     // true: Require variables/functions to be defined before being used
        "newcap"        : true,     // true: Require capitalization of all constructor functions e.g. `new F()`
        "noarg"         : true,     // true: Prohibit use of `arguments.caller` and `arguments.callee`
        "noempty"       : true,     // true: Prohibit use of empty blocks
        "nonew"         : true,     // true: Prohibit use of constructors for side-effects (without assignment)
        "plusplus"      : false,    // true: Prohibit use of `++` & `--`
        "quotmark"      : "single", // Quotation mark consistency:
                      //   false    : do nothing (default)
                      //   true     : ensure whatever is used is consistent
                      //   "single" : require single quotes
                      //   "double" : require double quotes
        "undef"         : true,     // true: Require all non-global variables to be declared (prevents global leaks)
        "unused"        : true,     // true: Require all defined variables be used
        "strict"        : true,     // true: Requires all functions run in ES5 Strict Mode
        "trailing"      : true,     // true: Prohibit trailing whitespaces
        "maxparams"     : 5,        // {int} Max number of formal params allowed per function
        "maxdepth"      : false,    // {int} Max depth of nested blocks (within functions)
        "maxstatements" : false,    // {int} Max number statements per function
        "maxcomplexity" : false,    // {int} Max cyclomatic complexity per function
        "maxlen"        : 120,      // {int} Max number of characters per line

        // Relaxing
        "asi"           : false,     // true: Tolerate Automatic Semicolon Insertion (no semicolons)
        "boss"          : false,     // true: Tolerate assignments where comparisons would be expected
        "debug"         : true,      // true: Allow debugger statements e.g. browser breakpoints.
        "eqnull"        : true,      // true: Tolerate use of `== null`
        "es5"           : true,      // true: Allow ES5 syntax (ex: getters and setters)
        "esnext"        : false,     // true: Allow ES.next (ES6) syntax (ex: `const`)
        "evil"          : false,     // true: Tolerate use of `eval` and `new Function()`
        "expr"          : false,     // true: Tolerate `ExpressionStatement` as Programs
        "funcscope"     : false,     // true: Tolerate defining variables inside control statements"
        "globalstrict"  : true,      // true: Allow global "use strict" (also enables 'strict')
        "iterator"      : false,     // true: Tolerate using the `__iterator__` property
        "lastsemic"     : true,      // true: Tolerate omitting a semicolon for the last statement of a 1-line block
        "laxbreak"      : false,     // true: Tolerate possibly unsafe line breakings
        "laxcomma"      : false,     // true: Tolerate comma-first style coding
        "loopfunc"      : false,     // true: Tolerate functions being defined in loops
        "multistr"      : false,     // true: Tolerate multi-line strings
        "proto"         : false,     // true: Tolerate using the `__proto__` property
        "scripturl"     : false,     // true: Tolerate script-targeted URLs
        "smarttabs"     : true,      // true: Tolerate mixed tabs/spaces when used for alignment
        "shadow"        : false,     // true: Allows re-define variables later in code e.g. `var x=1; x=2;`
        "sub"           : false,     // true: Tolerate using `[]` notation when it can still be expressed in dot notation
        "supernew"      : false,     // true: Tolerate `new function () { ... };` and `new Object;`
        "validthis"     : false,     // true: Tolerate using this in a non-constructor function

        // Environments
        "browser"       : true,     // Web Browser (window, document, etc)
        "couch"         : false,    // CouchDB
        "devel"         : true,     // Development/debugging (alert, confirm, etc)
        "dojo"          : false,    // Dojo Toolkit
        "jquery"        : true,     // jQuery
        "mootools"      : false,    // MooTools
        "node"          : false,    // Node.js
        "nonstandard"   : false,    // Widely adopted globals (escape, unescape, etc)
        "prototypejs"   : false,    // Prototype and Scriptaculous
        "rhino"         : false,    // Rhino
        "worker"        : false,    // Web Workers
        "wsh"           : false,    // Windows Scripting Host
        "yui"           : false,    // Yahoo User Interface

        // Legacy
        "nomen"         : false,    // true: Prohibit dangling `_` in variables
        "onevar"        : false,    // true: Allow only one `var` statement per function
        "passfail"      : false,    // true: Stop on first error
        "white"         : true,     // true: Check against strict whitespace and indentation rules

        // Custom Globals
        "predef"        : [         // additional predefined global variables
          "define",
          "Base",
          "module",

          // test
          "require",
          "exports",
          "process",
          "describe",
          "it",
          "xdescribe",
          "xit",
          "beforeEach",
          "afterEach"
        ],

        // Ignored Warnings
        "-W013": true, // Missing space after 'x'. It fires with "function() { }"
        "-W058": true, // Missing '()' invoking a constructor.
        "-W070": true  // Extra comma. (it breaks older versions of IE)
      },

      all: [ 'src/*.js', 'test/*.js' ]
    }

  });

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-requirejs');

  // Load the plugin that provides the 'uglify' task.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('build.convert', 'Generate files for browser', function() {
    grunt.util.spawn({ cmd: 'r.js', args: [ '-convert', 'src', 'src.requirejs' ] }, this.async());
  });

  grunt.registerTask('build.clean', 'Generate files for browser', function() {
    grunt.util.spawn({ cmd: 'rm', args: [ '-r', 'src.requirejs' ] }, this.async());
  });

  grunt.registerTask('build', 'Generate files for browser', function() {
    grunt.task.run('jshint', 'build.convert', 'requirejs', 'build.clean');
  });

  // Default task(s).
  grunt.registerTask('default', ['build']);

};
