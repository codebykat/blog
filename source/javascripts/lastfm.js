function showLastfmFeed(tweets, twitter_user) {
  var timeline = document.getElementById('lastfm'),
      content = '';

  //for (var t in tweets) {
  //  content += '<li>'+'<p>'+'<a href="http://twitter.com/'+twitter_user+'/status/'+tweets[t].id_str+'">'+prettyDate(tweets[t].created_at)+'</a>'+linkifyTweet(tweets[t].text.replace(/\n/g, '<br>'), tweets[t].entities.urls)+'</p>'+'</li>';
  //}
  //timeline.innerHTML = content;
}

function getTwitterFeed(user) {
  //$.ajax({
  //    url: "http://api.twitter.com/1/statuses/user_timeline/" + user + ".json?trim_user=true&count=" + (count + 20) + "&include_entities=1&exclude_replies=" + (replies ? "0" : "1") + "&callback=?"
  //  , type: 'jsonp'
  //  , error: function (err) { $('#tweets li.loading').addClass('error').text("Twitter's busted"); }
  //  , success: function(data) { showTwitterFeed(data.slice(0, count), user); }
  //})
}
