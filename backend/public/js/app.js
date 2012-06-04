var APP_ID = '146577522141106';

// TODO: remove, used only for dev.
//var firendsData = [{"name":"Yael Peled Adam","id":"8618149"},{"name":"Ella Ben-Tov","id":"522034861"},{"name":"Ronit Reger","id":"522239234"},{"name":"Ilya Sakharov","id":"540044215"},{"name":"Tal Goldbloom","id":"555329200"},{"name":"Gabi Perry","id":"559148860"},{"name":"Yoni Shtein","id":"560091387"},{"name":"Amit Apple","id":"563538726"},{"name":"Avi Carmon","id":"581266131"},{"name":"Raviv Tamir","id":"594729116"},{"name":"Revital Ben-Hamo","id":"617232453"},{"name":"Gilad Elyashar","id":"625611013"},{"name":"Ariela Boursi","id":"628311325"},{"name":"Ilay Roitman","id":"634048237"},{"name":"Dror Cohen","id":"670223584"},{"name":"Eran Gonen","id":"674748651"},{"name":"Shahar Yekutiel","id":"680956963"},{"name":"Ravit Tal","id":"685176459"},{"name":"Zack Dvey-Aharon","id":"691683727"},{"name":"Eran Shahar","id":"700493001"},{"name":"Chen Tsofi","id":"708162492"},{"name":"Eyal Badash","id":"708591957"},{"name":"Ran Levitzky","id":"712741345"},{"name":"Polina Krimshtein","id":"741780149"},{"name":"Ami Turgman","id":"744673514"},{"name":"Revital Barletz","id":"744777534"},{"name":"Itai Frenkel","id":"747008278"},{"name":"Einam Schonberg","id":"758049829"},{"name":"Sharon Gingold","id":"776872499"},{"name":"Edo Yahav","id":"809953065"},{"name":"Avigad Oron","id":"832032368"},{"name":"Oded Nahir","id":"1032228138"},{"name":"Shai Ber","id":"100000404810108"},{"name":"Noam Keidar","id":"100000454296282"},{"name":"Alexander Sloutsky","id":"100001315798911"},{"name":"Ron Dar Ziv","id":"100001779702520"},{"name":"Sivan Krigsman","id":"100001873082153"},{"name":"Yoav Helfman","id":"100002066173780"}];
//var meData = {"name":"Elad Ben-Israel","id":"620032"};  

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
    var isShaken = "false";

   // Start watching the acceleration
   function startWatch() {
      var previousReading = {
          x: null,
          y: null,
          z: null
      }

      navigator.accelerometer.watchAcceleration(function (acceleration) {
        var changes = {};
        bound = 0.5;
        
        if (previousReading.x !== null || isShaken === "true" ) {
            changes.x = Math.abs(previousReading.x, acceleration.x);
            changes.y = Math.abs(previousReading.y, acceleration.y);
            changes.z = Math.abs(previousReading.z, acceleration.z);

            if (changes.x > bound && changes.y > bound && changes.z > bound) {
              shaken();
            }
        }

        previousReading = {
        x: acceleration.x,
        y: acceleration.y,
        z: acceleration.z
        }


        }, onError, { frequency: 3000 });
  }

  function shaken(){
      isShaken = "true";
      navigator.notification.vibrate(2500);
      pair();
      isShaken = "false";
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
    
    // TODO: remove
    //showFriends(firendsData)
    //return; 

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
    //FB.api('/' + meData.id + '/picture', function(imageURL) {
      var meImage = new Image();
      meImage.src = imageURL;
      meImage.onload = function() {
        var w = meImage.width * 2;
        var h = meImage.height * 2;

        var obj = createImage(meImage, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
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

    var duplicates = canvas.width / SZ * canvas.height / SZ / friends.length;
    var shownFriends = []
    friends.forEach(function(f) {
      for (var i = 0; i < duplicates; i++) {
        shownFriends.push(f);
      }
    });

    return shownFriends.forEach(function(friend) {
      var imageURL = 'https://graph.facebook.com/' + friend.id + '/picture';
      var img = new Image();
      img.src = imageURL;
      


      img.onload = function() {
        
        var deg = Math.random()*2 - 1;
        console.log(deg);
        x = Math.floor(Math.random() * canvas.width + 1);
        y = Math.floor(Math.random() * canvas.height + 1);
        var obj = createImage(img, x, y, SZ, SZ, null, deg);
      
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
      };
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
