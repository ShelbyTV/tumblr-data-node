/*
 * tumblr-data : a poller-node sub
 */

var EE2 = require('eventemitter2').EventEmitter2;
var getPageLinks = require('./get_page_links.js');

module.exports = {

  emitter : new EE2(),
  querystring : require('querystring'),
  dao : require('redis-daos').build('tumblr-poller'),
  limit : 1000,
  tumblr : require('tumblr-api-client')('mrw08LmNseqVVIa6i8nO5UEl78fxXOGcaSe978iZyrswS2a8Wj', 'mefqdRTB2eNlTE5EnS3U8Raa5oMKFvo3Llhj2yyTAPGqu2Go90'),

  poll : function(uid){
    var self = this;
    self.dao.getUserInfo(uid, function(e, info){
      var params = {
        type : 'video',
        limit: 50 
      };
      if (info.last_seen){
        params.since_id = info.last_seen;
        params.offset = 1;
      }
      self.tumblr.getDashboard(params, info.access_token, info.access_token_secret, function(e, feed){
        if (e || !feed || !feed.response || !feed.response.posts.length){
          if (e) {
            console.log('http error:', e);
          } else {
            console.log('no feed returned'); 
          }
        } else {
          self.setLastSeen(uid, feed.response.posts[0].id);
          //more recent at the top
          feed.response.posts.forEach(function(post){
            var links = getPageLinks(post);
            links.forEach(function(link){
              self.createJob(uid, link, post);
            });
          });
          console.log('initiating new poll');
          self.poll(uid);
        }
      });
    });
  },

  createJob : function(uid, link, post){
    var job_spec = {
      "tumblr_status_update":post,
      "url":link,
      "provider_type":"tumblr",
      "provider_user_id":uid
    };
    this.emitter.emit('link',job_spec);
  },

  setLastSeen : function(uid, last_seen_id){
    this.dao.setUserProperty(uid, 'last_seen', last_seen_id, function(){});
  }

};
