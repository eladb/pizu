var server = require('./lib/app');
server.listen(process.env.PORT || 3000);
console.log('Listening on %d', process.env.PORT || 3000);
