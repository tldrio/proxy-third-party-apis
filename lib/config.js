var env = process.env.NODE_ENV || 'development'
  , config = { };

switch(env) {
  case 'development':
    config.origin = 'localhost:8888';   // The protocol is determined on a per request basis
    config.dbHost = 'localhost';
    config.dbPort = 27017;
    config.dbName = 'dev-db';
    break;

  case 'production':
    config.origin = 'tldr.io';   // The protocol is determined on a per request basis
    config.dbHost = 'localhost';
    config.dbPort = 27017;
    config.dbName = 'prod-db';
    break;

  case 'staging':
    config.origin = 'staging.tldr.io';   // The protocol is determined on a per request basis
    config.dbHost = 'localhost';
    config.dbPort = 27017;
    config.dbName = 'prod-db';
    break;
}

module.exports = config;
