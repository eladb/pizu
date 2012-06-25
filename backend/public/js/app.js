
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

    //Enable swiping...
    enableSwiping();
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

function logOut(){
  var browser = 
    navigator.userAgent.indexOf('Chrome') !== -1;

  if (browser) {
    // for browsers  
    FB.logout(function(s) {
      console.log(s);
      return location.reload();
    });
  }

  CDV.FB.logout(function(s) {
    console.log(s);
    return location.reload();
  });

  
}

var int = null;

function shakeAnimation() {
  console.log("shake it shake it baby ...");
  var img = document.getElementById('shakeIphone');
  if (img != null) {
    img.className = 'shake';
    img.addEventListener('webkitAnimationEnd', function(){  
    this.className = '';
    });
  }
}

// The watch id references the current `watchAcceleration`
var watchID = null;
  
// Start watching the acceleration
function startWatch() {
  $('#dvProgress').css("visibility","hidden");
  console.log('visible');
  $('ul.polaroids').css("visibility","visible");
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

            //hide polaroids
            $('ul.polaroids').css("visibility","hidden");
            location.href = "#mutualFriends";
            loadMutualFriends(fbid);
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


  
var d = 5;

}

function loadMutualFriends(pairId){
  
  var graph = '/me/mutualfriends/' + pairId;

  FB.api(graph, function (res) {
    console.log('response:' + JSON.stringify(res));
    var friends = res.data;

    mutulFriendsContainer = $('div.inside');
    mutulFriendsContainer.empty();
    var line = "<a href=\"#\"><img src=\"https://graph.facebook.com/" + pairId + "/picture?type=large\" /></a>";
    mutulFriendsContainer.append(line);

    friends.forEach(function (friend) {
        var firstName = friend.name.split(" ")[0];
        var line = "<a href=\"#\"><img src=\"https://graph.facebook.com/" + friend.id + "/picture?type=large\" alt=\"" + firstName + "\" /></a>";
        mutulFriendsContainer.append(line);
        
    });
    
    $('div.inside a:first-child').addClass("active");
    //call init.js MutualFriendAnimation methods
    MutualFriendsAnimation.init();
  });
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

function enableSwiping(){
  var swipeOptions=
    {
      swipeUp:swipeUp,
      swipeDown:swipeDown,
      threshold:30,
      allowPageScroll:"none" 
    }
    
  $("#mutualFriends").swipe( swipeOptions );
}

function swipeUp(){
  MutualFriendsAnimation.events.control('prev');
}

function swipeDown(){
  MutualFriendsAnimation.events.control('next');
}



