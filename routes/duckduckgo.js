var async = require('async')
  , request = require('request')
  , _ = require('underscore')
  , client = require('redis').createClient()
  , prefix = 'preview-ddg:';

module.exports = function (req, res, next) {
   var batch = []
    , results = [];

  if (!req.body.batch) { req.body.batch = []; }

  async.map( req.body.batch
   , function (entry, callback) {
      console.log('[REQUEST]', entry, req.ip);
      return callback();
      //client.get(prefix+ entry, function (err, reply) {
        //if (err) {
          //return callback(err);
        //}
        //if (reply) {
          //console.log('[CACHE]', entry);
          //callback(null, JSON.parse(reply));
        //}
        //else {
         //console.log('[ASK DDG]', entry);
         //request.get({ url: 'https://api.duckduckgo.com/?q=' + entry.replace(' ','+') +'&o=json'
                   //, timeout: 1000
                  //}, function (err, res, body) {
                    //if (err) {
                        //console.log('[ERR] On single request',err);
                      //return callback(err);
                    //}

                    //try {
                      //var response = JSON.parse(body)
                        //, previewText = response.Abstract || response.Definition;
                        //console.log('[RESPONSE]', entry, previewText);

                      //if (previewText.length) {
                        //client.set(prefix+ entry, JSON.stringify({ entry: entry, previewText: previewText, heading: response.Heading }));
                        //callback(null, { entry: entry, previewText: previewText, heading: response.Heading });
                      //} else {
                        //client.set(prefix+ entry, JSON.stringify({}));
                        //callback(null, {});
                      //}
                    //} catch(e) {
                      //return callback(e);
                    //}
                  //});

        //}

      //});

   }, function (err, results) {
        if (err) {
          console.log('[ERROR] in batch', err, results);
          return res.send(408, err);
        }
        //results = _.filter(results, function(result) { return result.previewText;});
        //console.log('[RESULTS]', results);
        //res.json(200, results);
      res.json(200, []);
  });

}
