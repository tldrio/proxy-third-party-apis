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
      var articlePreviewData = {}
        , articlePreview
        , match = article.description.match(/<img(.*?)src="(http:\/\/torrentfreak.com.*?)"(.*?)>/);
      articleFetched ++;
      articlePreviewData.title = article.title;
      articlePreviewData.date = article.pubDate;
      articlePreviewData.urls = [ article.guid, article.origlink ];
       // Remove all the html at the end of the summaries of TF
      articlePreviewData.preview = article.summary.replace(/<.*>/,'');
      if (match) {
        articlePreviewData.image = match[2];
      }
      articlePreview = new ArticlePreviews(articlePreviewData);
      articlePreview.save(function (err) {
        articleSaved ++;
        if (done && articleSaved === articleFetched) {
          callback();
        }
      });
    })
    .on('end', function () {
      done = true;
    });

}

db.connectToDatabase(function (err) {
  if (!err) { console.log('Connection to the database opened'); }
  async.each(feeds, parseFeed, function (err) { process.exit();});
  //parseFeed('http://feed.torrentfreak.com/Torrentfreak');
  //parseFeed('http://feeds.feedburner.com/TorrentfreakBits');
});
