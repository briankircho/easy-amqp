var amqp = require('amqp'),
    Chain = require('./chain'),
    events = require('events'),
    util = require('util');

var easyamqp = module.exports = function(options, implOptions) {
  events.EventEmitter.call(this);

  if(typeof(options) === "string") {
    options = { url : options };
  }
  this.options = options;
  this.implOptions = implOptions;
  this.connQueue = [];
  return this;
}

util.inherits(easyamqp, events.EventEmitter);

easyamqp.prototype.connection = function(readyCallback) {
  if(!this.conn) {
    var self = this;
    this.conn = amqp.createConnection(this.options, this.implOptions);
    this.conn.on('ready', function() {
      self.ready = true;
      self.connQueue.forEach(function(readyCallback) {
        readyCallback(self.conn);;
      })
    });
    this.conn.on('error', function(err) {
      if(self.listeners('error').length == 0) {
        throw err;
      }
      self.emit('error', err);
    });
  }

  if(!this.ready) {
    this.connQueue.push(readyCallback);
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


