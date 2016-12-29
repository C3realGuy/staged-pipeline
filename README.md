[![License](http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-badge-4.png)](http://www.wtfpl.net/)

StagedPipeline
================

StagedPipeline is a javascript library with which you can easily implement
a staged pipeline. It's aimed to be easy to use.

## WTF is a 'staged pipeline' ?

A staged pipeline behaves similiar to a normal pipeline you maybe know
from express.js or other js projects (i'm sure you can find them also
outside the js world). The problem with 'normal express like' pipelines
is, that all callbacks assigned to a pipeline get executed in parallel.
You can't control the order how they will be executed and you never know
in which state the other callbacks are. <br>
I try to solve this problem by introducing stages. <br>
Stages have a fixed order defined by `stagePos`. It's an integer starting
by 0 (zero). To every stage you can asign an unlimited number of callback
functions. Now if you execute your pipeline, it will first execute all callbacks assigned to the first stage (stagePos=0) in parallel. As soon as all executed callbacks finished and called the next() parameter, it will go on to the next stage. And so on. <br>
As you see, you have a bit more control about when a callback should get called without losing the parallel awesomeness of pipelines.

## Examples

```
// just import this lib as usual
const stagedPipeline = require('staged-pipeline');

const stagedPipeline = require('./stagedpipeline.js');

// now create a new stagedPipeline
let examplePipe = new stagedPipeline();

// just an example object representing an user. Think of a ftp user or something.
let user = {userName: 'test', permissions: ['a','b','c']};

// We want that the user object gets passed to all our later callbacks. Of course
// you can define more than one argument.
examplePipe.args = [user];

// Some examples how you can create stages.
examplePipe.createStage('firstStage'); // stagePos = 0
examplePipe.createStage('thirdStage'); // stagePos = 1
examplePipe.createStageBefore('thirdStage', 'secondStage'); // stagePos = 1, thirdStage has now the stagePos = 2
// There is also a .createStageAfter() function. Behaves similiar to createStageBefore ;)

// Now assign some callbacks
// We always do this with .use()
examplePipe.use('firstStage', function checkPermissionA(user, next) {
  console.log('[0] I\'m in the first stage!');
  console.log('[0] user looks like this:', user);
  // query a database or anything
  user.hasPermissionA = user.permissions.indexOf('a') !== -1;
  next();
});
examplePipe.use('firstStage', function checkPermissionB(user, next) {
  console.log('[0][checkPermissionB] I\'m also in the first stage! I\'m running in parallel with checkPermissionA()!');
  console.log('[0][checkPermissionB] user looks like this:', user);
  // query again a database or anything
  setTimeout(function() {
    console.log('[0][checkPermissionB] After 100 forced mili seconds i know what to do!');
    user.hasPermissionB = user.permissions.indexOf('b') !== -1;
    console.log('[0][checkPermissionB] So next!');
    next();

  }, 100);
});

examplePipe.use('secondStage', function executeSomething(user, next) {
  console.log('[1][executeSomething] Huhuu i\'m in the second stage!');
  console.log('[1][executeSomething] user looks like this:', user);
  if(!user.hasPermissionA && !user.hasPermissionB) {
    return next('permission denied');
  }
  console.log('[1][executeSomething] I have all permission i need, now i can do STUFF!');
  // but ouups, some error occured

  next('oups...error. It\'s fine if you see this. Should behave like this.');

});

examplePipe.use('thirdStage', function whichWillNeverBeExecutedBecauseOfError(user, next) {
  console.log('If i ever print this, somethings wrooong! My sole purpose is to never get executed. Proud.');
  next();
});

// And fire!
examplePipe.execute(function(err) {
  if(err) throw err;
  console.log("done!");
});
```


## In which environments can i use your lib?

Basically wherever you want. However, i only use and therefore tested it in node.js environments. But it's plain javascript using some es6 features already implemented in the current v8 (december 2016). So to make it work properly in most browsers, you should consider using a transpiler.




# License:
------------

# Do what the fuck you want to public license

Version 2, December 2004

Copyright (C) `2016` `C3realGuy` `<email>`

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

          DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
 TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. You just DO WHAT THE FUCK YOU WANT TO.
