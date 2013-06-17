var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , WikipediaAbstracts = require('../lib/models').WikipediaAbstracts
  , prefix = 'preview-ddg:'
  , execTime = require('exec-time')
  , profiler
  ;

module.exports = function (req, res, next) {
   var batch = []
    , results = [];

  profiler = new execTime('DDGPROF ' + req.ip)
  profiler.beginProfiling();
  profiler.step("Begin");

  if (!req.body.batch) { req.body.batch = []; }

  async.mapLimit( req.body.batch
   , 5
   , function (entry, callback) {
        WikipediaAbstracts.findOne({ entry_lowercase: entry.toLowerCase()}, function (_err, mongoReply) {
        if ( _err) {
          return callback({ _err:_err});
        }
        if (mongoReply) {
          console.log('[DDG][CACHE MONGO]', entry);
          callback(null, mongoReply);
        }
        else {
         console.log('[DDG][NONCACHE]', entry);
         request.get({ url: 'https://api.duckduckgo.com/?q=' + entry.replace(' ','+') +'&o=json&t=tldr'
                   , timeout: 1000
                  }, function (err, res, body) {
                    if (err) {
                        console.log('[DDG][ERR] On single request',entry, err);
                      return callback(err);
                    }

                    try {
                      var response = JSON.parse(body)
                        , previewText = response.Abstract || response.Definition;
                        console.log('[DDG][RESPONSE]', entry);

                      if (previewText.length) {
                        WikipediaAbstracts.findOneAndUpdate({ entry_lowercase: entry.toLowerCase() }
                                                        , { entry: entry, previewText: previewText, heading: response.Heading }
                                                        , { upsert: true}
                                                        , function (err) {
                                                          if (err) {
                                                            console.log('EEERRRR upserting', err, entry);
                                                          }
                                                        });
                        callback(null, { entry: entry, previewText: previewText, heading: response.Heading });
                      } else {
                        WikipediaAbstracts.findOneAndUpdate({ entry_lowercase: entry.toLowerCase() }
                                                        , {}
                                                        , { upsert: true}
                                                        , function (err) {
                                                          if (err) {
                                                            console.log('EEERRRR upserting', err, entry);
                                                          }
                                                        });
                        callback(null, {});
                      }
                    } catch(e) {
                      return callback(e);
                    }
                  });

        }

      });

   }, function (err, results) {
       profiler.step("Finished getting articles");
        if (err) {
          console.log('[DDG][ERROR] in batch', err);
          return res.send(408, err);
        }
        results = _.filter(results, function(result) { return result.previewText;});
        console.log('[DDG][RESULTS]', _.pluck(results, 'entry'));
        res.json(200, results);
  });

}
