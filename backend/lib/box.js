module.exports = function(options) {
  options = options || {};
  var capacity = options.capacity || 2;
  var ttl = options.ttl || 5000;

  var api = new process.EventEmitter();

  var payloads = {};
  var timeout = null;

  api.deposit = function(key, payload) {
    console.log('DEPOSIT %s', key);

    payloads[key] = payload;

    if (!timeout) {
      timeout = setTimeout(function() {
        if (Object.keys(payloads).length === capacity) {
          api.emit('full', payloads);
        }
        else{
          api.emit('timeout');
        }
        api.empty();
      }, ttl);
    }    
  };

  api.empty = function() {
    clearTimeout(timeout);
    timeout = null;
    payloads = {};
  };

  return api;
};