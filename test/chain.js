var should = require('should'),
    Chain = require('../chain');

describe('Chain', function() {
  describe('#add()', function() {
    it('should add to callQueue', function() {
      var myChain = new Chain({}, 'subscribe', ['my-exchange']);
      myChain.callQueue.should.eql([
        ['subscribe', ['my-exchange']
      ]]);
      myChain.queue('my-queue');
      myChain.callQueue.should.eql([
        ['subscribe', ['my-exchange']],
        ['queue', ['my-queue']]
      ]);
    });
  });

  describe('#run()', function() {
    it('should call run after publish to exchange', function(done) {
      var myChain = new Chain({
        connection : function(cb) {
          cb({
            exchange : function(name, options, cb) {
              name.should.equal('my-exchange');
              cb({
                publish : function(routingKey, message) {
                  routingKey.should.equal('routing.key');
                  message.should.equal('message text');
                  done();
                }
              });
            }
          })
        }
      }, 'exchange', ['my-exchange']);
      myChain.publish('routing.key', 'message text');
    });

    it('must call queue before subscribe', function() {
      var myChain = new Chain({
        connection : function(cb) {
          cb({
            exchange : function(name, options, cb) {
              cb()
            }
          }); }
      }, 'exchange', ['my-exchange']);
      (function(){
        myChain.subscribe('my-queue', function() { });
      }).should.throw('Must call queue before subscribe');
    });
  });
})