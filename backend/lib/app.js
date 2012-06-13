var express = require('express');
var path = require('path');
var urlparse = require('url').parse;
var createBox = require('./box');

var server = express.createServer();

var boxes = {};

server.use(express.bodyParser());

server.post('/', function(req, res) {
  console.log('body:', req.body);

  var purl = urlparse(req.url, true);

  var sid = purl.query.sid;
  var cid = purl.query.cid;

  var timeframe = Math.round(Date.now() / (1000 * 60));

  if (!sid || !cid) {
    return res.send("sid query parameter missing", 400);
  }

  var boxid = sid.toString() + '_' + timeframe;

  console.log('cid = %s, sid = %s, tf = %d, box = %s', cid, sid, timeframe, boxid);

  var box = boxes[boxid];
  if (!box) box = boxes[boxid] = createBox();

  box.on('timeout', function() {
    delete boxes[boxid];
    return res.send('No pair found - dont SHAKE alone', 404);
  });

  box.on('full', function(payloads) {
    delete boxes[boxid];
    return res.send(payloads);
  });

   if (process.env.NODE_ENV !== 'production') {
    box.deposit('563367011', {
      name: 'Ram',
      fbid: '563367011'
    });
   }

  box.deposit(cid, req.body);

  return true;
});

server.use(express.static(path.join(__dirname, '..', 'public')));

module.exports = server;