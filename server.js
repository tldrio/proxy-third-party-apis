var express = require('express')
  , server = express()
  , routes = require('./lib/routes')
  , config = require('./lib/config')
  , DbObject = require('./lib/db')
  , app = {};

// Create connection to the database
app.db = new DbObject( config.dbHost
                     , config.dbName
                     , config.dbPort
                     );



server.enable('trust proxy');

// Add specific headers for CORS
function CORS (req, res, next) {
  // Default value is http, unless req.protocol specifies otherwise
  var protocolMatch
    , requestedHeaders = req.headers['access-control-request-headers']
    , originToAllow
    ;

  if (!req.header('origin')) { return next(); }
  protocolMatch = req.headers.origin.match(/^https?/);
  if (!protocolMatch) { return next(); }
  originToAllow = protocolMatch[0] + '://' + config.origin;

  // If This is an API call from a registered client, allow CORS with him
  // OPTIONS request
  if (requestedHeaders) {
    requestedHeaders = requestedHeaders.split(',');
    if (requestedHeaders.indexOf('api-client-name') && requestedHeaders.indexOf('api-client-key')) {
      originToAllow = req.headers.origin;
    }
  }
  // GET request
  if (req.headers['api-client-name'] && req.headers['api-client-key']) {
    originToAllow = req.headers.origin;
  }

  res.header('Access-Control-Allow-Origin', originToAllow );
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, api-client-name, api-client-key');
  res.header('Access-Control-Expose-Headers', 'WWW-Authenticate');
  res.header('Access-Control-Allow-Credentials', 'true');   // Necessary header to be able to send the cookie back and forth with the client
  next();
}

server.use(CORS);
server.use(express.bodyParser());
server.use(server.router);

server.post('/duckduckgo', routes.duckduckgo );
server.post('/twitter', routes.twitter );
server.post('/youtube', routes.youtube );

app.db.connectToDatabase(function (err) {
  if (!err) { console.log('Connection to the database opened'); }
  server.listen(8914);
});

