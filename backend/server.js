var server = require('./lib/app');
server.listen(process.env.PORT || process.env.port || 3000);
console.log('Listening on %d', process.env.PORT || process.env.port || 3000);
console.log('Pizu version 2');

// create hook for github deployment
var githubhook = require('githubhook');
githubhook(8123, { 'pizuDeploy1980': 'https://github.com/eladb/pizu' }, function (err, payload) {
  if (err) {
    console.warn(err);
    return;
  }
  else {
    console.log('github post-recieve hook - exiting');
    process.exit(1);
  }
});
console.log('Started github hook on 8123');
