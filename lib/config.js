var env = process.env.NODE_ENV || 'development'
  , config = { };

switch(env) {
  case 'development':
    config.origin = 'localhost:8888';   // The protocol is determined on a per request basis
    break;

  case 'production':
    config.origin = 'tldr.io';   // The protocol is determined on a per request basis
    break;

  case 'staging':
    config.origin = 'staging.tldr.io';   // The protocol is determined on a per request basis
    break;
}

module.exports = config;
