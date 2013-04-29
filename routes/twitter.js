var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , client = require('redis').createClient()
  , prefix = 'preview-twitter:'
  , twitter = require('ntwitter')
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
    client.get(prefix+ entry.toLowerCase(), function (err, reply) {
      if (err) {
        return callback(err);
      }
      if (reply) {
        callback(null, JSON.parse(reply));
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
          var obj;
          if (result.profile_banner_url && !result.profile_banner_url.match(/brand_banners/)) {
            result.profile_banner_url = result.profile_banner_url + '/mobile';
          } else {
            result.profile_banner_url = 'https://abs.twimg.com/a/1366855397/t1/img/grey_header_web.png';
          }
          // Just store the data we need
          result = _.pick(result, 'screen_name','profile_banner_url', 'profile_image_url', 'name', 'description','statuses_count','friends_count','followers_count');
          obj = { entry: result.screen_name, result: result};
          client.set(prefix+ result.screen_name.toLowerCase() , JSON.stringify(obj));
          return obj;
        });
        res.json(200, results);
      });
    } else {
      res.json(200,  cachedResults);
    }

  });
}
