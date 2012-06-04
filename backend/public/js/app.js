var APP_ID = '146577522141106';

$(function() {

  $('#content').hide();

  var cid = null;
  var name = null;

  function after_login() {
    FB.api('/me', function(response) {
      name = response.name;
      cid = response.id;
      showMyImage();
      startWatch();
    });
  }

  var browser = 
    navigator.userAgent.indexOf('Chrome') !== -1 ||
    navigator.userAgent.indexOf('Safari') !== -1;

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

  $('#refresh').click(function(e) {
    e.preventDefault();
    alert('refreshed');
    window.location.reload();
  });

    // The watch id references the current `watchAcceleration`
    var watchID = null;

   // Start watching the acceleration
   function startWatch() {
      alert("StartWatch");
      var previousReading = {
          x: null,
          y: null,
          z: null
      }

      navigator.accelerometer.watchAcceleration(function (acceleration) {
        alert("watchAcceleration sucess");
        var changes = {},
        alert("test");
        bound = 0.2;
        alert("bound "+bound);
        if (previousReading.x !== null) {
            changes.x = Math.abs(previousReading.x, acceleration.x);
            changes.y = Math.abs(previousReading.y, acceleration.y);
            changes.z = Math.abs(previousReading.z, acceleration.z);

            alert("changes X " + changes.x + " Y " + changes.y + " Z " + changes.z);

            if (changes.x > bound && changes.y > bound && changes.z > bound) {
              shaken();
            }
        }

        previousReading = {
        x: reading.x,
        y: reading.y,
        z: reading.z
        }
        alert("previousReading X " + previousReading.x + " Y " + previousReading.y + " Z " + previousReading.z);

        }, onError, { frequency: 3000 });
  }

  function shaken(){
      alert("Shaken");
  }

  // Error
  function onError() {
      alert('onError!');
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

        $('#pair').addClass('disabled');

        console.log('sending post request', url);

        $.ajax({
          type: 'post',
          url: url,
          data: { name: name, fbid: cid },
        }).done(function(payload) {
          console.log('payload:' + payload);

          $('#pair').removeClass('disabled');
          
          for (var k in payload) {
            console.log('k=', k);
            if (k != cid) {
              var other = payload[k];

              console.log('found other payload:', payload[k]);
              $('#other').html(other.name);

              var fbid = other.fbid;

              var graph = '/me/mutualfriends/' + fbid;

              FB.api(graph, function(res) {
                console.log('response:'+JSON.stringify(res));
                var friends = res.data;
                showFriends(friends);
              });
            }
          }
        }).fail(function(jqxhr, textStatus, body) {
          $('#pair').removeClass('disabled');
          alert(body);
        });
      }, function (error) {
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
  }

  var layer = createLayer();
  var canvas = $('canvas')[0];
  canvasize(canvas, layer);

  function showMyImage() {
    FB.api('/me/picture', function(imageURL) {
      var meImage = new Image();
      meImage.src = imageURL;
      meImage.onload = function() {
        var w = meImage.width * 2;
        var h = meImage.height * 2;

        var obj = createImage(meImage, canvas.width / 2 - w, canvas.height / 2 - h, w, h);
        obj.onclick = function() {
          if (!this.visible) return;
          this.visible = false;
          pair();
        };

        layer.add(obj);
      };
    });
  }

  function showFriends(friends) {
    var x = 50;
    var y = 0;
    var SZ = 50;
    var queue = [];

    setInterval(function() {
      var i = queue.shift();
      if (i) layer.add(i);
    }, 10);

    return friends.forEach(function(friend) {
      var imageURL = 'https://graph.facebook.com/' + friend.id + '/picture';
      var img = new Image();
      img.src = imageURL;
      img.onload = function() {

        var obj = createImage(img, x, y, SZ, SZ);
        obj.friend = friend;
        obj.src = img.src;

        function openImage() {
          obj.bringToTop();

          var centerX = obj.x + obj.width / 2;
          var centerY = obj.y + obj.height / 2;
          var state = 'out';
          var v = 10;

          var iv = setInterval(function() {
            var m = state === 'out' ? 1 : -1;

            obj.width += v * m;
            obj.height += v * m;
            obj.onclick = null;
            obj.x = centerX - obj.width / 2;
            obj.y = centerY - obj.height / 2;

            if (obj.width > 200) {
              state = 'in';
            }

            if (obj.width <= SZ) {
              obj.width = SZ;
              obj.height = SZ;
              clearInterval(iv);
              obj.onclick = openImage;
            }
          }, 10);
        };

        obj.onclick = openImage;

        x += SZ;
  
        if (x > canvas.width) {
          y += SZ;
          x = 0;
        }

        queue.push(obj);
      }
    });
  }

  var refreshImage = new Image();
  refreshImage.src = 'img/refresh.png';
  var refreshButton = null;
  refreshImage.onload = function() {
    console.log('adding refresh');
    refreshButton = createImage(refreshImage, 0, 0, 50, 50);
    refreshButton.onclick = function() {
      window.location.reload();
    };
    layer.add(refreshButton);
  };
});
