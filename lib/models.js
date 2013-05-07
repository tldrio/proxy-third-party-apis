var mongoose = require('mongoose')
  , moment = require('moment')
  , utils = require('../lib/utils')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.Schema.ObjectId
  , TwitterProfiles
  , TwitterProfilesSchema
  , WikipediaAbstracts
  , WikipediaAbstractSchema
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

WikipediaAbstractSchema = new Schema(
  { entry_lowercase: { type: String, unique: true}
  , entry: { type: String}
  , previewText: { type: String}
  , heading: { type: String}
  }
, { strict: true }
);

// Define the model
WikipediaAbstracts = mongoose.model('wikipedia-abstracts', WikipediaAbstractSchema);

ArticlePreviewSchema = new Schema(
  { urls: [{ type: String, unique: true}]
  , title: { type: String}
  , date: { type: Date}
  , preview: { type: String}
  , image: { type: String}
  }
, { strict: true }
);

ArticlePreviewSchema.virtual('publicationDate').get(function () {
  return moment(this.date).format('MM/DD/YYYY');
});

ArticlePreviewSchema.virtual('summaryBullets').get(function () {
  var result = utils.sentenceParser(this.preview);
  if (result[result.length -1].match(/\[...\]/)) {
    result.pop();
  }

  return result;
});

ArticlePreviewSchema.set('toJSON', {
   virtuals: true
});


ArticlePreviewSchema.index({ urls: 1 }, { unique: true });

// Define the model
ArticlePreviews = mongoose.model('article-previews', ArticlePreviewSchema);



module.exports.TwitterProfiles = TwitterProfiles;
module.exports.WikipediaAbstracts = WikipediaAbstracts;
module.exports.ArticlePreviews = ArticlePreviews;
