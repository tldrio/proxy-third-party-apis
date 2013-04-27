  console.log('icl');
var async = require('async')
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

  console.log('TOTO');
twit
  .verifyCredentials(function (err, data) {
    console.log(data);
  }).showUser('charlesmigli', function (err, result) {
    console.log('ERR', err);
    console.log('result', result);

  });

