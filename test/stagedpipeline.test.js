/* eslint-env node, mocha */
/* eslint-disable max-len, require-jsdoc */
'use strict';

var should = require('should');
var Pipeline = require('../stagedpipeline.js');

describe('AdvancedPipeline', function () {
  describe('#createStage()', function () {
    it('should append stage to pipe.stageNames and create empty array in pipe.stagePipelines and return correct position', function () {
      var pipe = new Pipeline();
      pipe.createStage('test').should.eql(0);
      pipe.stageNames.should.eql(['test']);
      pipe.stagePipelines.should.eql([[]]);

      pipe.createStage('test2').should.eql(1);
      pipe.stageNames.should.eql(['test', 'test2']);
      pipe.stagePipelines.should.eql([[], []]);
    });
  });
  describe('#createStageAfter()', function () {
    it('should place stage after afterStage', function () {
      var pipe = new Pipeline();
      pipe.createStage('test').should.eql(0);
      pipe.createStageAfter('test', 'test2').should.eql(1);
      pipe.stageNames.should.eql(['test', 'test2']);
      pipe.stagePipelines.should.eql([[], []]);
    });
    it('should place stage between afterStage and more stages after afterStage', function () {
      var pipe = new Pipeline();
      pipe.createStage('test1').should.eql(0);
      pipe.createStage('test3').should.eql(1);
      pipe.stageNames.should.eql(['test1', 'test3']);
      pipe.createStageAfter('test1', 'test2').should.eql(1);
      pipe.stageNames.should.eql(['test1', 'test2', 'test3']);
      pipe.stagePipelines.should.eql([[], [], []]);
    });
    it('should make sure that pipeline arrays are moved correctly', function () {
      var pipe = new Pipeline();
      var foo = function () { let hello = 1; }; // eslint-disable-line no-unused-vars
      pipe.createStage('test1').should.eql(0);
      pipe.createStage('test3').should.eql(1);
      pipe.use('test3', foo);
      pipe.createStageAfter('test1', 'test2').should.eql(1);

      pipe.stageNames.should.eql(['test1', 'test2', 'test3']);
      pipe.stagePipelines.should.eql([[], [], [['foo', foo]]]);
    });
  });
  describe('#createStageBefore()', function () {
    it('should add before', function () {
      var pipe = new Pipeline();
      var foo = function () { let hello = 2; }; // eslint-disable-line no-unused-vars
      pipe.createStage('test1').should.eql(0);
      pipe.createStage('test3').should.eql(1);
      pipe.use('test3', foo);
      pipe.createStageBefore('test3', 'test2').should.eql(1);
      // console.log("z", pipe.stageNames);
      pipe.stageNames.should.eql(['test1', 'test2', 'test3']);
      pipe.stagePipelines.should.eql([[], [], [['foo', foo]]]);
    });
  });
  describe('#removeStage()', function () {
    it('should remove stage, related pipeline elment and return true if stage is known', function () {
      let pipe = new Pipeline();
      pipe.createStage('test');
      pipe.stageNames.should.eql(['test']);
      pipe.stagePipelines.should.eql([[]]);
      pipe.removeStage('test').should.be.true();
      pipe.stageNames.should.eql([]);
      pipe.stagePipelines.should.eql([]);
    });
    it('should return false if stage is not known', function () {
      let pipe = new Pipeline();
      pipe.createStage('test');
      pipe.removeStage('test1').should.be.false();
    });
  });
  describe('#stageSize()', function () {
    it('should return how many stages we currently have', function () {
      var pipe = new Pipeline();
      pipe.stageSize().should.eql(0);
      pipe.createStage('test');
      pipe.stageSize().should.eql(1);
    });
  });
  describe('#hasStage()', function () {
    it('should return false if stage is not defined', function () {
      var pipe = new Pipeline();
      pipe.createStage('test');
      pipe.hasStage('test2').should.be.false();
    });
    it('should return true if stage is defined', function () {
      var pipe = new Pipeline();
      pipe.createStage('test');
      pipe.hasStage('test').should.be.true();
    });
  });
  describe('#use()', function () {
    it('should create extra stage if stage is not defined', function () {
      var pipe = new Pipeline();
      pipe.use(function a () {});
      pipe.stageNames.length.should.eql(1);
      pipe.use(function b () {});
      pipe.stageNames.length.should.eql(2);
    });
    it('should add function at right position in pipe.stagePipelines', function () {
      var pipe = new Pipeline();
      var foo = function () {};
      pipe.createStage('test1');
      pipe.createStage('test2');
      pipe.createStage('test3');
      pipe.use('test2', foo);
      pipe.stagePipelines.should.eql([[], [['foo', foo]], []]);
      // Test for more than one function
      var bar = function () { let hell = 1; }; // eslint-disable-line no-unused-vars
      pipe.use('test2', bar);
      pipe.stagePipelines.should.eql([[], [['foo', foo], ['bar', bar]], []]);
    });
    it('should use name if passed as second argument', function () {
      let pipe = new Pipeline();
      let fn = function anotherTestFuncName () {};
      pipe.use('testStage', 'testFuncName', fn);
      pipe.stagePipelines.should.eql([[['testFuncName', fn]]]);
    });
    it('should get function name if name is not passed as second argument', function () {
      let pipe = new Pipeline();
      function testFuncName () {}
      pipe.use('testStage', testFuncName);
      pipe.stagePipelines.should.eql([[['testFuncName', testFuncName]]]);
    });
    it('should get variable name if anonymous function is asigned to var', function () {
      let pipe = new Pipeline();
      var someVarNameAssignedToFunc = function () {};
      pipe.use('testStage', someVarNameAssignedToFunc);
      pipe.stagePipelines.should.eql([[['someVarNameAssignedToFunc', someVarNameAssignedToFunc]]]);
    });
    it('should not fail if no name is given as second argument and function is anonymous', function () {
      let pipe = new Pipeline();
      pipe.use('testStage', function () {});
      pipe.stagePipelines.should.eql([[['', function () {}]]]);
    });
  });
  describe('#unuse()', function () {
    it('should remove function from pipeline', function () {
      let pipe = new Pipeline();
      function testFn (next) { console.log('huhu'); next(); }
      pipe.use('test1', 'blubb', testFn);
      pipe.stagePipelines.should.eql([[['blubb', testFn]]]);
      pipe.unuse('test1', testFn).should.be.true();
      pipe.stagePipelines.should.eql([[]]);
    });
    it('should only remove one function from pipeline', function () {
      let pipe = new Pipeline();
      function testFn (next) { console.log('huhu'); next(); }
      pipe.use('test1', 'blubb', testFn);
      pipe.use('test1', 'blubb2', testFn);
      pipe.stagePipelines.should.eql([[['blubb', testFn], ['blubb2', testFn]]]);
      pipe.unuse('test1', testFn).should.be.true();
      pipe.stagePipelines.should.eql([[['blubb2', testFn]]]);
    });
  });
  describe('#_removeFunctionFromPipeline()', function () {
    it('should remove the function from pipeline', function () {
      let pipe = new Pipeline();
      function testFn () {}
      pipe.use('test', testFn);
      pipe.createStage('test2');
      pipe.stagePipelines.should.eql([[['testFn', testFn]], []]);
      pipe._removeFunctionFromPipeline({fnFunc: testFn}).should.eql(1);
      pipe.stagePipelines.should.eql([[], []]);
    });
    it('should remove only x functions from pipeline if limit=x', function () {
      let pipe = new Pipeline();
      function testFn () {}
      pipe.use('test', testFn);
      pipe.use('test1', testFn);
      pipe.use('test2', testFn);
      pipe.stagePipelines.should.eql([[['testFn', testFn]], [['testFn', testFn]], [['testFn', testFn]]]);
      pipe._removeFunctionFromPipeline({fnFunc: testFn, limit: 2});
      pipe.stagePipelines.should.eql([[], [], [['testFn', testFn]]]);
    });
    it('should remove all matching functions if limit is -1', function () {
      let pipe = new Pipeline();
      function testFn () {}
      pipe.use('test', testFn);
      pipe.use('test1', testFn);
      pipe.use('test2', testFn);
      pipe.stagePipelines.should.eql([[['testFn', testFn]], [['testFn', testFn]], [['testFn', testFn]]]);
      pipe._removeFunctionFromPipeline({fnFunc: testFn, limit: -1}).should.eql(3);
      pipe.stagePipelines.should.eql([[], [], []]);
    });
    it('should only remove functions from a specific stage is stage is not null', function () {
      let pipe = new Pipeline();
      function testFn () {}
      pipe.use('test', testFn);
      pipe.use('test1', testFn);
      pipe.use('test1', 'anotherTestFn', testFn);
      pipe.use('test2', testFn);
      pipe.stagePipelines.should.eql([[['testFn', testFn]], [['testFn', testFn], ['anotherTestFn', testFn]], [['testFn', testFn]]]);
      pipe._removeFunctionFromPipeline({fnFunc: testFn, stageName: 'test1', limit: -1});
      pipe.stagePipelines.should.eql([[['testFn', testFn]], [], [['testFn', testFn]]]);
    });
  });
  describe('#stageIterator()', function () {
    it('should yield stagePos, stageName und stagePipeline', function () {
      let pipe = new Pipeline();
      function testFn () {}
      pipe.use('test1', testFn);
      pipe.use('test2', 'anotherTestFn', testFn);
      pipe.use('test3', testFn);
      let stageIterator = pipe.stageIterator();
      pipe.stageNames.should.eql(['test1', 'test2', 'test3']);
      pipe.stagePipelines.should.eql([[['testFn', testFn]], [['anotherTestFn', testFn]], [['testFn', testFn]]]);
      stageIterator.next().should.eql({value: [0, 'test1', [['testFn', testFn]]], done: false});
      stageIterator.next().should.eql({value: [1, 'test2', [['anotherTestFn', testFn]]], done: false});
      stageIterator.next().should.eql({value: [2, 'test3', [['testFn', testFn]]], done: false});
      stageIterator.next().should.eql({value: undefined, done: true});
    });
  });
  describe('#unuse()', function () {

  });
  describe('#args', function () {
    it('should pass args to any function in pipeline chain', function (done) {
      var pipe = new Pipeline();
      var args = {a: 1, b: 2, d: 133, c: 42};
      pipe.args.push(args);
      let fn1GotCalled = false;
      pipe.use(function (passed, next) {
        fn1GotCalled = true;
        passed.test = 23;
        next();
      });
      let fn2GotCalled = false;
      pipe.use(function (passed2, next) {
        fn2GotCalled = true;
        passed2.test.should.eql(23);
        next();
      });
      pipe.execute(function (err) {
        should(err).be.null();
        fn1GotCalled.should.be.true();
        fn2GotCalled.should.be.true();
        done();
      });
    });
  });
  describe('#execute()', function () {
    it('should make sure that different stages get executed in series and never parallel', function (done) {
      var pipe = new Pipeline();
      pipe.args.push({a: 1, b: 3, c: 43});
      pipe.createStage('test1');
      pipe.createStage('test2');
      pipe.createStage('test3');
      let fn1Timestamp = 0;
      pipe.use('test1', function a (obj, next) {
        fn1Timestamp = Date.now();
        // console.log("test1");
        setTimeout(function () {
          // console.log("test1 next");
          next();
        }, 50);
      });
      let fn2Timestamp = 0;
      pipe.use('test2', function b (obj, next) {
        // console.log("test2");
        fn2Timestamp = Date.now();
        setTimeout(function () {
          // console.log("test2 next");
          next();
        }, 10);
      });

      let fn3Timestamp = 0;
      pipe.use('test3', function b (obj, next) {
        fn3Timestamp = Date.now();
        // console.log("test3");
        next();
        // console.log("test3 next");
      });
      pipe.execute(function (err) {
        should(err).be.null();
        fn1Timestamp.should.not.eql(0);
        fn2Timestamp.should.not.eql(0);
        fn3Timestamp.should.not.eql(0);
        // console.log(fn1Timestamp, fn2Timestamp, fn3Timestamp);
        fn1Timestamp.should.be.below(fn2Timestamp);
        fn2Timestamp.should.be.below(fn3Timestamp);
        done();
      });
    });
    it('should make sure that in-stage functions get called parallel', function (done) {
      let pipe = new Pipeline();
      pipe.args.push({a: 1, b: 3, c: 43});
      pipe.createStage('test1');
      pipe.createStage('test2');
      let fn1Called = 0;
      let fn1Next = 0;
      pipe.use('test1', function (obj, next) {
        fn1Called = Date.now();
        setTimeout(function () {
          fn1Next = Date.now();
          next();
        }, 10);
      });
      let fn2Called = 0;
      let fn2Next = 0;
      pipe.use('test1', function (obj, next) {
        fn2Called = Date.now();
        setTimeout(function () {
          fn2Next = Date.now();
          next();
        }, 3);
      });
      pipe.execute(function (err) {
        should(err).be.null();
        // console.log(fn1Called, fn1Next);
        // console.log(fn2Called, fn2Next);
        fn1Called.should.not.eql(0);
        fn1Next.should.not.eql(0);
        fn2Called.should.not.eql(0);
        fn2Next.should.not.eql(0);
        fn2Called.should.be.below(fn1Next);
        fn1Called.should.be.below(fn2Next);
        done();
      });
    });
    it('should make sure that later stages get skipped if error occurs and that error gets passed to done callback', function (done) {
      let pipe = new Pipeline();
      pipe.createStage('test1');
      pipe.createStage('test2');
      let fn1GotCalled = false;
      pipe.use('test1', function fn1 (next) {
        fn1GotCalled = true;
        setTimeout(function () {
          next('some error');
        }, 10);
      });
      let fn2GotCalled = false;
      pipe.use('test1', function fn2 (next) {
        fn2GotCalled = true;
        next();
      });
      let fn3GotCalled = false;
      pipe.use('test2', function fn3 (next) {
        fn3GotCalled = true;
        next();
      });
      pipe.execute(function (err) {
        err.should.eql('some error');
        fn1GotCalled.should.be.true();
        fn2GotCalled.should.be.true();
        fn3GotCalled.should.be.false();
        done();
      });
    });
  });
});
