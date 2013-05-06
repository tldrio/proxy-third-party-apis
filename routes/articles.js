var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , utils = require('../lib/utils')
  , ArticlePreviews = require('../lib/models').ArticlePreviews;


module.exports = function (req, res, next) {
   var batch = req.body.batch
    , results = [];

  if (!req.body.batch) { req.body.batch = []; }

  console.log('[ARTICLES][BATCH]', batch);
  ArticlePreviews.find({ urls: { $in: batch } }, function (err, reply) {
    if (err) {
      return res.send(503);
    }
    console.log('REAPLUY', reply);
    res.json(200, reply);
  });

}
