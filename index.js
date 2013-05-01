var easyamqp = require('./easyamqp');

module.exports = {
  createConnection : function(options, implOptions) {
    return new easyamqp(options);
  }
}