## easy-amqp

Implements a wrapper around the node.js amqp module to provide more fluent and easy to use RabbitMQ support

# Usage

Install via NPM

    $ npm install easy-amqp

# Overview

In amqp the example given to subscribe to a queue on the default topic exchange is:

```javascript
var amqp = require('amqp');
var connection = amqp.createConnection({ host: 'dev.rabbitmq.com' });

// Wait for connection to become established.
connection.on('ready', function () {
  // Use the default 'amq.topic' exchange
  connection.queue('my-queue', function(q){
      // Catch all messages
      q.bind('#');

      // Receive messages
      q.subscribe(function (message) {
        // Print messages to stdout
        console.log(message);
      });
  });
});
```

With easy-amq, the same code can be written as:

```javascript
require('easy-amqp')
  .createConnection('amqp://dev.rabbitmq.com:5672')
  .queue('my-queue')
  .bind('#')
  .subscribe(function(message) {
    console.log(message);
  });
```


# Connection

To create a connection use the createConnection method on the module similar to amqp

```javascript
var easyamqp = require('easy-amqp');

// Connections using an amqp URI are supported
easyamqp.createConnection("amqp://localhost:5672");

// Connections using options and implOptions like the amqp driver are supported
easyamqp.createConnection({ host: 'localhost', port: 5672, login: 'guest', password: 'guest', vhost: '/' }, { defaultExchangeName: "amq.topic" })
```

# Exchange

Create one or more exchanges on the connection object

```javascript
conn
  .exchange('my-exchange')
  .exchange('another-exchange', { type : 'fanout', durable : true }) // options from the amqp driver are supported
  // You must call publish or subscribe after this for the exchange(s) to be created
```

# Queue

Create one or more queues on the connection object

```javascript
conn
  .queue('my-queue')
  .queue('another-queue', { durable : true }); // options from the amqp driver are supported
  // You must call subscribe after this for the queue(s) to be created
```

# Binding

Calling bind will create a binding from the last referenced queue or exchange

```javascript
conn
  .queue('my-queue')
  .bind('my-exchange', '#'); // Create binding from my-queue to my-exchange
  // You must call subscribe after this for the bindings to be created
```

# Subscribe

Calling this method will subscribe to the last referenced queue

```javascript
conn
  .queue('my-queue')
  .bind('my-exchange', '#')
  .subscribe(function(message, headers, deliveryInfo, rawMessage, queue) {
    console.log(message)
  });
```

# Publish

Calling this method will publish a message to the last referenced exchange

```javascript
conn
  .exchange('my-exchange')
  .publish('routing-key', 'message')
```

# Tests

To run the tests use

    $ make test
