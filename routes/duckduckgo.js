var async = require('async')
  , request = require('request')
  , _ = require('underscore');

module.exports = function (req, res, next) {
   var batch = []
    , results = [];

  if (!req.body.batch) { req.body.batch = []; }

  async.map( req.body.batch
   , function (entry, callback) {
       request.get({ url: 'https://api.duckduckgo.com/?q=' + entry.replace(' ','+') +'&o=json'
                  }, function (err, res, body) {
                    if (err) {
                      return callback(err);
                    }

                    var response = JSON.parse(body)
                      , previewText = response.Abstract || response.Definition;

                    if (previewText.length) {
                      callback(null, { entry: entry, previewText: previewText, heading: response.Heading });
                    } else {
                      callback(null, {});
                    }
                  });

   }, function (err, results) {
        if (err) {
          console.log('ERR', err);
          return res.send(500, err);
        }
        results = _.filter(results, function(result) { return result.previewText;});
        console.log('Results', results);
        res.json(200, results);
  });

}
