var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , utils = require('../lib/utils')
  , twitter = require('ntwitter')
  , TwitterProfiles = require('../lib/models').TwitterProfiles
  , twit = new twitter({
    consumer_key: 'nvLiQe1xD75twWMuwfTrGA',
    consumer_secret: 'MWm5gfEz0dlerSoeydFHRSujZIWtcP8dE83RdrpiiA',
    access_token_key: '815594540-fRn9I7k37dnTSVtmSm333yi6WZ7kvNqN4CrzWpI',
    access_token_secret: '7J7hd8djK1qLHzBZ8ySkD0d83TD5THJ9YVi88dXXXNc'
  });


module.exports = function (req, res, next) {
   var batch = req.body.batch
    , results = [];

  if (!req.body.batch) { req.body.batch = []; }

  //ad hoc blacklist
  batch = _.without(batch, 'share');
  console.log('[TWITTER][BATCH]', batch);
  async.map( batch, function (entry, callback) {
    TwitterProfiles.findOne({ screen_name_lowercase: entry.toLowerCase()}, function (err, reply) {
      if (err) {
        return callback(err);
      }
      if (reply) {
        callback(null, { entry: reply.screen_name ,result:reply });
      }
      else {
        callback(null, { entry: entry });
      }
    });

  }, function (err, resultsFromCache) {
    var nonCachedEntries = _.pluck(_.filter(resultsFromCache, function (element) { return !element.result;}), 'entry')
      , cachedResults = _.filter(resultsFromCache, function (element) { return element.result;});
    console.log('[TWITTER][NONCACHED]', nonCachedEntries);
    console.log('[TWITTER][CACHED]', _.pluck(cachedResults, 'entry') );

    if (nonCachedEntries.length) {
      twit.showUser(batch.toString(), function (err, results) {
        if (err) {
          console.log('[TWITTER][ERROR]', err);
          res.json(408);
        }
        results = _.map(results, function (result) {
          var obj
            , profile;
          if (result.profile_banner_url && !result.profile_banner_url.match(/brand_banners/)) {
            result.profile_banner_url = result.profile_banner_url + '/mobile';
          } else {
            result.profile_banner_url = 'https://abs.twimg.com/a/1366855397/t1/img/grey_header_web.png';
          }
          // Just store the data we need
          result.statuses_count = utils.formatNumber(result.statuses_count, ' ');
          result.followers_count = utils.formatNumber(result.followers_count, ' ');
          result.friends_count = utils.formatNumber(result.friends_count, ' ');
          result.screen_name_lowercase = result.screen_name.toLowerCase();

          //Store in DB
          TwitterProfiles.findOneAndUpdate({ screen_name_lowercase: result.screen_name_lowercase }
                                          , result
                                          , { upsert: true}
                                          , function (err) {
                                            if (err) {
                                              console.log('EEERRRR upserting', err, result.screen_name);
                                            }
                                          });
          obj = { entry: result.screen_name, result: result};
          return obj;
        });
        res.json(200, results);
      });
    } else {
      res.json(200,  cachedResults);
    }

  });
}
