'use strict';

const AWS = require('aws-sdk');

module.exports.randomimagefrombreed = (event, context, callback) => {
  'use strict';

  const s3 = new AWS.S3({
    region : 'eu-west-1'
  });

  var path = event.path;
  var cleanPath = path.replace(/^\/|\/$/g, '');
  var split = cleanPath.split('/');
  var breed = split[1];

  if (split[3] == 'images') {
    breed += '-' + split[2];
  }

  var params = {
    Bucket: 'dog-ceo-stanford-files',
    Delimiter: "",
    Prefix: breed,
    MaxKeys: 10000
  };

  s3.listObjectsV2(params, function (error, result) {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the folders.'
      });
      return;
    }

    var statusCode;
    var responseObject;

    if (!result.Contents.length) {
      statusCode = 404;
      responseObject = {status: 'error', code: '404', message: 'Breed not found'};
    } else {
      statusCode = 200;
      var i;
      var s3ObjectList = result.Contents;
      var s3Object = s3ObjectList[Math.floor(Math.random()*s3ObjectList.length)];
      var s3File = 'https://images.dog.ceo/breeds/' + s3Object.Key;

      responseObject = {status: 'success', message: s3File};
    }

    // create a response
    var response = {
      statusCode: statusCode,
      headers: {'cache-control': 'private, no-cache'},
      body: JSON.stringify(responseObject)
    };

    callback(null, response);

  });

};