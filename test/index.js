'use strict';

/* globals describe, before, after, it */

var
  should = require('chai').should(),
  mockery = require('mockery'),
  //should = require('should'),
  require_dir_all = require('../index');

var MODULE_NAME = 'require-dir-all',
  MODULE_PATHNAME = '../../../' + MODULE_NAME;

describe('#simple demo test', function() {

  var root, modules, module1, module2;

  before('before', function() {
    root = '../demo/simple/modules/';

    modules = require_dir_all(root);

    module1 = require(root+'module1');
    module2 = require(root+'module2');
  });

  it('should have all properties corresponding to each module inside require-d directory', function() {
    modules.should.have.all.keys('module1', 'module2');
  });

  it('should have same value for module1 as regular require()', function() {
    modules.should.have.property('module1', module1);
  });

  it('should have same value for module2 as regular require()', function() {
    modules.should.have.property('module2', module2);
  });

});

describe('#same_dir test', function() {

  var root, modules, module1, module2;

  before('before', function() {
    root = '../demo/same_dir/';

    // We need to replace register-dir-all module as for tests it is not installed
    mockery.registerMock('register-dir-all', require('../index'));
    mockery.registerAllowables([
      MODULE_PATHNAME
    ]);
    mockery.enable({
      // warnOnReplace: false,
      // warnOnUnregistered: false,
      useCleanCache: true
    });

    modules = require(root+'app');
    module1 = require(root+'module1');
    module2 = require(root+'module2');
  });

  after(function disableMockery() {
    mockery.deregisterAll();
    mockery.disable();
  });

  it('should have all properties corresponding to each module inside require-d directory', function() {
    modules.should.have.all.keys('module1', 'module2');
  });

  it('should have same value for module1 as regular require()', function() {
    modules.should.have.property('module1', module1);
  });

  it('should have same value for module2 as regular require()', function() {
    modules.should.have.property('module2', module2);
  });

  it('should not have property for require\'ing module', function() {
    modules.should.not.have.any.keys('app');
  });

});

describe('#recursive demo test', function() {

  var root, modules, module1, module2, module3, module4, module5;

  before('before', function() {
    root = '../demo/recursive/modules/';

    modules = require_dir_all(
      root, {
        recursive: true,
        excludeDirs: /^excluded.*$/
      } );

    module1 = require(root+'module1');
    module2 = require(root+'module2');
    module3 = require(root+'dir1/module3');
    module4 = require(root+'dir1/dir2/module4');
    module5 = require(root+'dir.a.b.c/module5');

    //console.log('modules:', JSON.stringify(modules, null, 2));
  });

  it(' should have all properties corresponding to each module and directory inside top-level require-d directory', function() {
    modules.should.have.all.keys('module1', 'module2', 'dir1', 'dir.a.b.c');
  });

  it('should have all properties corresponding to each module and directory inside 2nd-level require-d directory', function() {
    modules.dir1.should.have.all.keys('module3', 'dir2');
  });

  it('should have all properties corresponding to each module and directory inside 3rdp-level require-d directory', function() {
    modules.dir1.dir2.should.have.all.keys('module4');
  });

  it('should not have properties corresponding to excluded directories inside top-level require-d directory', function() {
    modules.should.not.have.any.keys('excluded');
  });

  it('should have same value for module1 as regular require()', function() {
    modules.module1.should.eql(module1);
  });

  it('should have same value for module2 as regular require()', function() {
    modules.module2.should.eql(module2);
  });

  it('should have same value for dir1.module3 as regular require()', function() {
    modules.dir1.module3.should.eql(module3);
  });

  it('should have same value for dir1.dir2.module4 as regular require()', function() {
    modules.dir1.dir2.module4.should.eql(module4);
  });

  it('should handle directory name with dots (dir.a.b.c)', function() {
    modules['dir.a.b.c'].module5.should.eql(module5);
  });

});

describe('#map demo test', function() {

  var root, modules, module1, module2, obj1, obj2;

  before('before', function() {
    root = '../demo/map/modules/';

    var data = {
      module1: 'data for module1',
      module2: 'data for module2'
    };

    modules = require_dir_all(
      root, {
        map: function(reqModule) {
          //reqModule.exports = new reqModule.exports(data[reqModule.name]);
          reqModule.exports = new reqModule.exports(data[reqModule.name]);
          reqModule.name = '_' + reqModule.name;
        }
      }
    );

    obj1 = new (require(root+'module1'))(data.module1);
    obj2 = new (require(root+'module2'))(data.module2);
  });

  it('should have all properties corresponding to each module inside require\'d directory ' +
    'according to name mapping', function() {
    modules.should.have.all.keys('_module1', '_module2');
  });

  it('should have same value for module1 as regular require()', function() {
    modules._module1.should.eql(obj1);
  });

  it('should have same value for module2 as regular require()', function() {
    modules._module2.should.eql(obj2);
  });

});

