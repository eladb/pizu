///<reference path="facebook_js_sdk.js" />
///<reference path="jquery-1.7.2.min.js" />
///<reference path="cordova-1.7.0.js" />
///<reference path="cdv-plugin-fb-connect.js" />
///<reference path="geohash.js" />
///<reference path="app.js" />

var APP_ID = '146577522141106';

$(function() {

  var cid = null;
  var name = null;

  function after_login() {
    FB.api('/me', function(response) {
      name = response.name;
      cid = response.id;

      FB.api('/me/friends', function(friendsData) {
        loadFriendsImages(friendsData.data);
      });

    startWatch();  
    });
  }

  var browser = 
    navigator.userAgent.indexOf('Chrome') !== -1;

  if (browser) {
    // for browsers
    FB.init({ appId: APP_ID, cookie: true });  
    FB.getLoginStatus(function(s) {
      if (s.status !== 'connected') {
        return FB.login(after_login);
      }
      else {
        return after_login();
      }
    });
  }

  // phonegap initialization
  document.addEventListener("deviceready", function() {
    CDV.FB.init(APP_ID);
    CDV.FB.getLoginStatus(function(s) {
      console.log(JSON.stringify(s));
      if (s.status !== 'connected') {
        return CDV.FB.login(null, after_login);
      }
      else {
        return after_login();
      }
    });
  }, false);

  function shakeAnimation() {
    console.log("shake it shake it baby ...");
    var img = document.getElementById('shakeIphone');
    img.className = 'shake';
    img.addEventListener('webkitAnimationEnd', function(){
      this.className = '';
    });

    //$('div#shake img').removeClass("");
    //console.log($('div#shake img'));
    
    //$('div#shake img').addClass("shake");
    //console.log($('div#shake img'));

    //$('div#shake img').transition({ rotate: '30deg' },{queue:true,duration:'slow',easing:"easein"});
    //$('div#shake img').transition({ rotate: '-30deg' },{queue:true,duration:'slow',easing:"easein"});
    //$('div#shake img').transition({ rotate: '30deg' },{queue:true,duration:'slow',easing:"easein"});
    //$('div#shake img').transition({ rotate: '-30deg' },{queue:true,duration:'slow',easing:"easein"});
    //$('div#shake img').animate({rotate: '100'},{duration : 1000});
    //$('div#shake img').css("-webkit-animation", "shake 0.7s ease-in-out 0s 4 alternate");
  }

  // The watch id references the current `watchAcceleration`
  var watchID = null;
    
  // Start watching the acceleration
  function startWatch() {
    
    if (!('accelerometer' in navigator)) {
      console.log('no accelerometer');
      return;
    }

    var previousReading = {
        x: null,
        y: null,
        z: null
    }

    console.log('visible');
    $('div#shake').css("visibility","visible");
    shakeAnimation();
    
    watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
      var changes = {};
      bound =10;
      
      if (previousReading.x !== null) {
        changes.x = Math.abs(previousReading.x - acceleration.x);
        changes.y = Math.abs(previousReading.y - acceleration.y);
        changes.z = Math.abs(previousReading.z - acceleration.z);

        if (changes.x > bound && changes.y > bound) {
          shaken();
        }
      }
        
      previousReading = {
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z
      }        
    }, onAccelerometerError, { frequency: 100 });
  }

  function shaken(){
    $('div#shake').css("visibility","hidden");
    navigator.accelerometer.clearWatch(watchID);
    navigator.notification.vibrate(2500);
    pair();
  }

  // Error
  function onAccelerometerError() {
    alert("Acceleration Error occured");
  }

  function pair() {
    if (!cid || !name) {
      console.error('still not logged in');
      return;
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {  
        console.log(position);

        var geoHash = encodeGeoHash(position.coords.latitude, position.coords.longitude);
        console.log('geoHash: ' + geoHash);

        geoHash = geohash.slice(0,7);

        console.log('geoHash after slice: ' + geoHash);
        console.log('name=%s cid=%d', name, cid);

        var url = '/?sid=' + geoHash + '&cid=' + cid;

        console.log('sending post request', url);

        $.ajax({
          type: 'post',
          url: url,
          data: { name: name, fbid: cid },
        }).done(function(payload) {
          console.log('payload:' + payload);
          
          for (var k in payload) {
            console.log('k=', k);
            if (k != cid) {
              var other = payload[k];

              console.log('found other payload:', payload[k]);

              var fbid = other.fbid;

              var graph = '/me/mutualfriends/' + fbid;

              FB.api(graph, function(res) {
                console.log('response:'+JSON.stringify(res));
                var friends = res.data;
//                //showFriends(friends);
//                //stop backround animation
//                clearInterval(backroundIntervalId);

//                var sharedFriends = [];
//                var friendsLength = friendsImageQueue.length;
//                // Find not-shared friends and drop them
//                while (friendsImageQueue.length != 0)
//                {
//                  var img = friendsImageQueue.pop();
//                  var found = false;
//                  friends.forEach(function(friend){
//                    if (friend.id == img.fbid) { 
//                      found = true; 
//                    };
//                  });
//                  if (found) {
//                    sharedFriends.push(img);
//                  }; 
//                };
              });
            }
          }
        }).fail(function(jqxhr, textStatus, body) {
          alert(body);
          startWatch();
        });
      }, function (error) {
        startWatch();
        switch(error.code) 
        {
          case error.TIMEOUT:
            alert ('Timeout');
            break;
          case error.POSITION_UNAVAILABLE:
            alert ('Position unavailable');
            break;
          case error.PERMISSION_DENIED:
            alert ('Permission denied');
            break;
          case error.UNKNOWN_ERROR:
            alert ('Unknown error');
            break;
        }
      });
    }
    else{
      startWatch();
    }
  }

  function loadFriendsImages(friends){
    return friends.forEach(function(friend) {
        var imageURL = 'https://graph.facebook.com/' + friend.id + '/picture';
        var img = new Image();
        img.src = imageURL;

        img.onload = function() {
        var firstName=friend.name.split(" ")[0];
        //var line = "<li><a href=\"" + imageURL + "\" title=\""+ firstName +"\">"+img.outerHTML+"</img></a></li>";
        var line = "<li><a href=\"#\" title=\""+ firstName +"\">"+img.outerHTML+"</img></a></li>";
        $('ul').append(line);
    };
  });
 }
});


