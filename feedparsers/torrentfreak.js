#! /usr/local/bin/node
var FeedParser = require('feedparser')
  , ArticlePreviews = require('../lib/models').ArticlePreviews
  , config = require('../lib/config')
  , DbObject = require('../lib/db')
  , request = require('request')
  , db
  , articleFetched = 0
  , articleSaved = 0
  , done = false;

// Create connection to the database
db = new DbObject( config.dbHost
                 , config.dbName
                 , config.dbPort
                 );

function parseFeed () {
  request('http://feed.torrentfreak.com/Torrentfreak')
    .pipe(new FeedParser())
    .on('error', function(error) {
      // always handle errors
    })
    .on('meta', function (meta) {
      // do something
    })
    .on('article', function (article) {
      var articlePreviewData = {}
        , articlePreview;
      articleFetched ++;
      articlePreviewData.title = article.title;
      articlePreviewData.date = article.pubDate;
      articlePreviewData.urls = [ article.guid, article.origlink ];
       // Remove all the html at the end of the summaries of TF
      articlePreviewData.preview = article.summary.replace(/<.*>/,'');
      articlePreviewData.image = article.description.match(/<img(.*?)src="(.*?)"(.*?)>/)[2];
      articlePreview = new ArticlePreviews(articlePreviewData);
      articlePreview.save(function (err) {
        articleSaved ++;
        if (done && articleSaved === articleFetched) {
          process.exit(0);
        }
      });
    })
    .on('end', function () {
      done = true;
    });

}

db.connectToDatabase(function (err) {
  if (!err) { console.log('Connection to the database opened'); }
  parseFeed();
});
