var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , client = require('redis').createClient()
  , utils = require('../lib/utils')
  , prefix = 'preview-youtube:';

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
          , duration = response.contentDetails.duration.match(/PT((\d{1,5})M)?((\d{1,2})S)?/);

        response = { viewCount: utils.formatNumber(response.statistics.viewCount,' ')
                   , likeCount: utils.formatNumber(likeCount, ' ')
                   , dislikeCount: utils.formatNumber(dislikeCount, ' ')
                   , commentCount: utils.formatNumber(response.statistics.commentCount, ' ')
                   , thumbnail: response.snippet.thumbnails.medium.url
                   , title: response.snippet.title
                   , likePercentage: Math.round(100 * likeCount / (likeCount + dislikeCount))
                   , dislikePercentage: Math.round(100 * dislikeCount / (likeCount + dislikeCount))
                   , duration: { minutes: duration[2] || '0' , seconds: duration[4]|| '00'}
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
