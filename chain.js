var Chain = module.exports = function(easyamqp, method, args) {
  this.easyamqp = easyamqp;
  this.callQueue = [];
  this.running = false;
  this.add(method, args);
  return this;
}

Chain.prototype.add = function(method, arguments) {
  this.callQueue.push([method, Array.prototype.slice.call(arguments, 0)]);
}

Chain.prototype.run = function() {
  if(this.running || this.callQueue.length === 0) return;
  this.running = true;

  var self = this;
  this.easyamqp.connection(function(conn) {
    var call = self.callQueue.shift();
    if(!call) {
      return;
    }
    var method = call[0],
        args = call[1];

    switch(method) {
      case "queue":
        args[1] = args[1] || {};
        args[2] = function(queue) {
          self.lastQueue = self.lastQueueOrExchange = queue;
          self.running = false;
          self.run();
        };
        conn.queue.apply(conn, args);
        break;
      case "exchange":
        args[2] = function(exchange) {
          self.lastExchange = self.lastQueueOrExchange = exchange;
          self.running = false;
          self.run();
        };
        conn.exchange.apply(conn, args);
        break;
      case "bind":
      case "bind_headers":
        self.lastQueueOrExchange[method].apply(self.lastQueueOrExchange, args);
        self.running = false;
        self.run();
        break;
      case "publish":
        if(self.lastExchange) {
          self.lastExchange.publish.apply(self.lastExchange, args);
        } else {
          conn.publish.apply(conn, args);
        }
        self.running = false;
        self.run();
        break;
      case "subscribe":
      case "subscribeRaw":
        if(!self.lastQueue) {
          throw new Error("Must call queue before " + method);
        }
        var idx = args.length-1,
            original = args[idx];

        args[idx] = function(msg, headers, deliveryInfo, rawMessage) {
          original(msg, headers, deliveryInfo, rawMessage, self.lastQueue);
        };

        self.lastQueue[method].apply(self.lastQueue, args);
        self.running = false;
        self.run();
        break;
    }
  });
};

['queue', 'exchange', 'bind', 'bind_headers'].forEach(function(method) {
  Chain.prototype[method] = function() {
    this.add(method, arguments);
    return this;
  }
});

['publish', 'subscribe', 'subscribeRaw'].forEach(function(method) {
  Chain.prototype[method] = function() {
    this.add(method, arguments);
    this.run();
    return this;
  }
});