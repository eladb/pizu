///<reference path="facebook_js_sdk.js" />
///<reference path="jquery-1.7.2.min.js" />
///<reference path="cordova-1.7.0.js" />
///<reference path="cdv-plugin-fb-connect.js" />
///<reference path="geohash.js" />
///<reference path="app.js" />

var APP_ID = '146577522141106';


  var cid = null;
  var name = null;

$(function() {

  function after_login() {
    FB.api('/me', function(response) {
      name = response.name;
      cid = response.id;

      FB.api('/me/friends', function(friendsData) {
        loadFriendsImages(friendsData.data,20);
      });
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
});

var int = null;

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
  $('#dvProgress').css("visibility","hidden");
  console.log('visible');
  $('div#shake').css("visibility","visible");
  shakeAnimation();
  int = setInterval(shakeAnimation,7000);

  if (!('accelerometer' in navigator)) {
    console.log('no accelerometer');
    return;
  }

  var previousReading = {
      x: null,
      y: null,
      z: null
  }

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
  clearInterval(int);
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
  console.log("Pair");
  
  $('#shake').css("visibility","hidden");
  $('#searching').css("visibility","visible");
  
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
        
        $('#searching').css("visibility","hidden");

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
                  location.href = "MutualFriends.html";
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
        $('#searching').css("visibility","hidden");
        openAlert(jqxhr.responseText,'closePairFailureAlert()');
      });
    }, function (error) {
      $('#searching').css("visibility","hidden");
      switch(error.code) 
      {
        case error.TIMEOUT:
          openAlert('Timeout','closePairFailureAlert()');
          break;
        case error.POSITION_UNAVAILABLE:
          openAlert('Position unavailable','closePairFailureAlert()');
          break;
        case error.PERMISSION_DENIED:
          openAlert('Permission denied','closePairFailureAlert()');
          break;
        case error.UNKNOWN_ERROR:
          openAlert('Unknown error','closePairFailureAlert()');
          break;
      }
    });
  }
  else{
    $('#searching').css("visibility","hidden");
    startWatch();
  }
}

function loadFriendsImages(friends,minLoadingFriendNumber){
  var maxShowFriends = 25;
  var randomNumber = Math.floor((Math.random()*(friends.length - maxShowFriends)));
  var sliceLength = Math.min(friends.length,maxShowFriends);
  var loadingFriendsArray = friends.slice(randomNumber,randomNumber+sliceLength);
  var loadingFriendIndex = 1;

  return loadingFriendsArray.forEach(function(friend) {
    var imageURL = 'https://graph.facebook.com/' + friend.id + '/picture';
    var img = new Image();
    img.src = imageURL;
    
    img.onload = function() {
      var firstName=friend.name.split(" ")[0];
      //var line = "<li><a href=\"" + imageURL + "\" title=\""+ firstName +"\">"+img.outerHTML+"</img></a></li>";
      var line = "<li><a title=\""+ firstName +"\">"+img.outerHTML+"</img></a></li>";
      $('ul.polaroids').append(line);

      if(loadingFriendIndex == minLoadingFriendNumber){
        afterLoadMinimalFriends();
      }

      loadingFriendIndex++;
    };
  });
}

function afterLoadMinimalFriends() {
  $('ul.polaroids').css("visibility","visible");
  startWatch();  
}

function closePairFailureAlert(){
  //$.unblockUI();
  $('#alert span').removeClass("openAlert").addClass("closeAlert");
  //var alert = document.getElementById('alert');
  console.log($('#alert span'));
  //alert.className += 'closeAlert';
  startWatch();
}

function openAlert(body,closeAlertDelegate){
  //set the close callback
  $('.dismissAlert').attr('onclick','').attr('onclick',closeAlertDelegate);
  $('.alert').text(body);
  $('#alert span').removeClass("closeAlert").addClass("openAlert");
  //$.blockUI({ onBlock: function() { 
    //          }  
    //        }); 
  
  
}



