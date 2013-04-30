var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , client = require('redis').createClient()
  , prefix = 'preview-youtube:';

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

module.exports = function (req, res, next) {
   var batch = req.body.batch
    , results = [];

  if (!req.body.batch) { req.body.batch = []; }

  console.log('[YOUTUBE][BATCH]', batch);
  async.map( batch, function (entry, callback) {
    request.get({ url: 'https://www.googleapis.com/youtube/v3/videos?id='+ entry +'&part=contentDetails,statistics,snippet&fields=*&key=AIzaSyDon29gmxcVt-GN6CUdK2vrwgMxJCcwv3o'
               }, function (err, res, body) {


      try {
        var response = JSON.parse(body).items[0]
          , likeCount = parseInt(response.statistics.likeCount,10)
          , dislikeCount = parseInt(response.statistics.dislikeCount,10)
          , duration = response.contentDetails.duration.match(/PT(.*)M(.*)S/);

        response = { viewCount: numberWithCommas(response.statistics.viewCount)
                   , likeCount: numberWithCommas(likeCount)
                   , dislikeCount: numberWithCommas(dislikeCount)
                   , commentCount: numberWithCommas(response.statistics.commentCount)
                   , thumbnail: response.snippet.thumbnails.medium.url
                   , title: response.snippet.title
                   , likePercentage: Math.round(100 * likeCount / (likeCount + dislikeCount))
                   , dislikePercentage: Math.round(100 * dislikeCount / (likeCount + dislikeCount))
                   , duration: { minutes: duration[1], seconds: duration[2]}
        };
        console.log('[YOUTUBE][RESPONSE]', entry);
        callback(null, { entry: entry, result: response});
      } catch(e) {
        console.log('[YOUTUBE][ERR]', e);
        return callback(e);
      }

    });

  }, function (err, results) {
      if (err) {
        console.log('[YOUTUBE][ERROR]', err);
        return res.json(408);
      }
      res.json(200, results );
  });
}
