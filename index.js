const Replay = require('replay');
// trypical headers
Replay.headers = [/^x-amz-target/].concat(Replay.headers.filter(header => !header.test('authorization') && !header.test('x-')));

// monkey patch replay to avoid immediate max retries and ultimately timeout
const rproxy = require('replay/lib/proxy');
rproxy.prototype.setTimeout = () => { };

// adding a proxy to the change to apply a monkey patch to a private class
Replay.use((request, callback) => {
  request.on('response', (response) => {
    if (request.method !== 'PUT') {
      // monkey patch to effectively remove an unnecessary call to resume
      response.resume = () => { };
    }
  });
  callback();
});

const aws = require('aws-sdk');

aws.config.update({
  dynamoDbCrc32: false,
});

module.exports = Replay;

