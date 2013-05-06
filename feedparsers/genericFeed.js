#! /usr/local/bin/node
var FeedParser = require('feedparser')
  , ArticlePreviews = require('../lib/models').ArticlePreviews
  , config = require('../lib/config')
  , DbObject = require('../lib/db')
  , request = require('request')
  , async = require('async')
  , db
  , feeds = ['http://feed.torrentfreak.com/Torrentfreak'
    ,'http://feeds.feedburner.com/TorrentfreakBits'];
// Create connection to the database
db = new DbObject( config.dbHost
                 , config.dbName
                 , config.dbPort
                 );

function parseFeed (feedUrl, callback) {
  var articleFetched = 0
  , articleSaved = 0
  , done = false;
  request(feedUrl)
    .pipe(new FeedParser())
    .on('article', function (article) {
      console.log('-------');
      console.log(article);
    })
    .on('end', function () {
      done = true;
    });

}

db.connectToDatabase(function (err) {
  if (!err) { console.log('Connection to the database opened'); }
  parseFeed('http://feeds.feedburner.com/TheAtlanticWire');
});
