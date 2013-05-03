var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.ObjectId
  , TwitterProfiles
  , TwitterProfilesSchema
  ;

TwitterProfilesSchema = new Schema(
  { screen_name_lowercase: { type: String, unique: true}
  , screen_name: { type: String }
  , profile_image_url:{ type: String }
  , name: { type: String }
  , profile_banner_url: { type: String }
  , description: { type: String }
  , followers_count: { type: String }
  , statuses_count: { type:String }
  , friends_count: { type: String }
  }
, { strict: true }
);

// Define the model
TwitterProfiles = mongoose.model('twitter-profiles', TwitterProfilesSchema);
// Export Post
module.exports.TwitterProfiles = TwitterProfiles;
