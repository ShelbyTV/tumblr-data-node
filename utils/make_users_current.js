var dao = require('redis-daos').build('tumblr-poller');

var complete = 0;

var callback = function(){
  complete+=1;
  console.log(complete, 'completed');
};

dao.getUserSet(function(e, users){
  var now = Math.round((new Date().getTime())/1000);
  console.log('updating', users.length);
  users.forEach(function(u){
    dao.redis.hdel(dao.getUserInfoKey(u), 'last_seen', callback);
  });
});
