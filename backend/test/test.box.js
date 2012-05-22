exports.not_full = function(test) {
  var box = require('../lib/box')({ ttl: 500 });

  box.on('full', function(payloads) {
    test.ok(false);
    test.done();
  });

  box.on('timeout', function() {
    test.done();
  })

  box.deposit('a', {x:4});
};

exports.full = function(test) {
  var box = require('../lib/box')();

  box.on('full', function(payloads) {
    test.deepEqual(payloads, { a: { x: 4 }, b: { y: 47 } });
    test.done();
  });

  box.on('timeout', function() {
    test.ok(false);
    test.done();
  });

  box.deposit('a', {x:4});
  box.deposit('b', {y:47});
};

exports.exceed_capacity = function(test) {
  var box = require('../lib/box')({ ttl: 500 });

  box.on('full', function(payloads) {
    test.ok(false);
    test.done();
  });

  box.on('timeout', function() {
    test.done();
  })

  box.deposit('a', {x:4});
  box.deposit('b', {x:4});
  box.deposit('c', {x:4});
};