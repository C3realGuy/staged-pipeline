function *foo() {
  yield [1, 2];
  yield [2, 3];
  yield [3, 4];
  yield [4, 5];
  yield [5, 6];
}

var it = foo();
for(let [i, s] of it) {
  console.log(i, s);
}
