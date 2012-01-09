var tumblr_utils = require(__dirname+'/tumblr_utils.js');
var exp = /\(?\bhttp:\/\/[-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[-A-Za-z0-9+&@#\/%=~_()|]/g;

module.exports = function(post){ 
  var urls = [];
  if (post.type === 'video'){
    var post_embed = post.player[0].embed_code;
    if (exp.test(post_embed)){
      var links = unescape(post_embed).match(exp).uniques();
      links.forEach(function(link){
        var video = tumblr_utils.findUrl(link);
        if (video.url !== null && typeof post === 'object'){ 
          urls.push(video.url);
        }
      });
    }
  } 
  return urls;
};
