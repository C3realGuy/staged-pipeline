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

// now create a new stagedPipeline
let examplePipe = new stagedPipeline();

// Some examples how you can create stages.
examplePipe.createStage('firstStage'); // stagePos = 0
examplePipe.createStage('thirdStage'); // stagePos = 1
examplePipe.createStageBefore('thirdStage', 'secondStage'); // stagePos = 1, thirdStage has now the stagePos = 2

// Now assign some callbacks
examplePipe.use('firstStage', function checkPermissionA(user, next) {
  console.log('I\'m in the first stage!');
  console.log('user looks like this:', user);
  // query a database or anything
  user.hasPermissionA = true;
  next();
});
examplePipe.use('firstStage', function checkPermissionB(user, next) {
  console.log('I\'m also in the first stage! I'm running in parallel with checkPermissionA()!');
  console.log('user looks like this:', user);
  // query again a database or anything
  user.hasPermissionB = false;
  next();
});

examplePipe.use('secondStage', function executeSomething(user, next) {
  console.log('Huhuu i\'m in the second stage!');
  console.log('user looks like this:', user);
  if(!user.hasPermissionA && !user.hasPermissionB) {
    return next('permission denied');
  }

  // I have all permissions i need, now i can do stuff
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
