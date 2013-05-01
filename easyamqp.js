var amqp = require('amqp'),
    Chain = require('./chain');

var easyamqp = module.exports = function(options, implOptions) {
  if(typeof(options) === "string") {
    options = { url : options };
  }
  this.options = options;
  this.implOptions = implOptions;
  return this;
}

easyamqp.prototype.connection = function(readyCallback) {
  if(!this.conn) {
    var self = this;
    this.conn = amqp.createConnection(this.options, this.implOptions);
    this.conn.on('ready', function() {
      self.ready = true;
    });
  }

  if(!this.ready) {
    var self = this;
    this.conn.on('ready', function() {
      readyCallback(self.conn);
    });
  } else {
    readyCallback(this.conn);
  }

  return this.conn;
}

easyamqp.prototype.end = function() {
  if(this.conn) {
    this.conn.end();
  }
};

['queue', 'exchange'].forEach(function(method) {
  easyamqp.prototype[method] = function() {
    return new Chain(this, method, arguments);
  }
});