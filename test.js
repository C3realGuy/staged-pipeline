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

  // Time for another example
});

