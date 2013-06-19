var easyamqp = require('./easyamqp');


module.exports = function(options, implOptions) {
  return new easyamqp(options, implOptions);
}

module.exports.createConnection = function(options, implOptions) {
  return new easyamqp(options, implOptions);
};
