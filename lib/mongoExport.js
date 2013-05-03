var TwitterProfiles = require('./models').TwitterProfiles
  , client = require('redis').createClient()
  , prefix = 'preview-twitter:'
  , _ = require('underscore')
  , config = require('./config')
  , DbObject = require('./db')
  , async = require('async')
  , utils = require('../lib/utils')
  , db;

// Create connection to the database
db = new DbObject( config.dbHost
                 , config.dbName
                 , config.dbPort
                 );

function mongoExport () {
  client.keys(prefix+ '*', function (err, keys) {
    async.each(keys
    , function (key, callback) {
      console.log('Key', key);
      client.get(key, function (err, reply) {
        if (!reply) {
          console.log('STAINGE NO REPLY');
          return callback('NO REPLY');
        }
        var result = JSON.parse(reply)
          , profile;
        result = result.result;

        if (!result.screen_name) {
          console.log('NO SCREEN NAME?', result);
          return;
        }

        result.screen_name_lowercase = result.screen_name.toLowerCase();
        result.statuses_count = utils.formatNumber(result.statuses_count, ' ');
        result.followers_count = utils.formatNumber(result.followers_count, ' ');
        result.friends_count = utils.formatNumber(result.friends_count, ' ');

        profile = new TwitterProfiles(result);
        profile.save(callback);
      });
    }
    , function (err) {
      if (err) {
        console.log('Error in Twitter migration',err);
      }
      process.exit(1);
    });
  });
}

db.connectToDatabase(function (err) {
  if (!err) { console.log('Connection to the database opened'); }
  mongoExport();
});

