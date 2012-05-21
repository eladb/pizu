var server = require('../lib/app');
var request = require('request');

module.exports = {
  setUp: function(cb) {
    console.log('starting server');
    server.listen(5555);
    return cb();
  },

  tearDown: function(cb) {
    console.log('stopping server');
    server.close();
    return cb();
  },

  test1: function(test) {
    var i = 0;
    
    var handle_response = function(err, res, body) {
      test.deepEqual(body, { 
        c1: { payload: 'c1_payload' },
        c2: { payload: 'c2_payload' } 
      });

      i++;

      if (i === 2) {
        test.done();
      }
    };

    req('c1', handle_response);
    setTimeout(function() { req('c2', handle_response); }, 1000)
  },

  test_timeout: function(test) {
    return req('c1', function(err, res, body) {
      test.equals(res.statusCode, 404);
      test.done();
    });
  },
};

function req(cid, fn) {
  var r1 = {
    url: 'http://localhost:5555?cid=' + cid + '&sid=1',
    method: 'post',
    json: true,
    body: {
      payload: cid + '_payload',
    }
  };

  return request(r1, fn);
}