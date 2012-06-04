var APP_ID = '146577522141106';

// TODO: remove, used only for dev.
/*r development = {
  friends: [{"name":"Yael Peled Adam","id":"8618149"},{"name":"Ella Ben-Tov","id":"522034861"},{"name":"Ronit Reger","id":"522239234"},{"name":"Ilya Sakharov","id":"540044215"},{"name":"Tal Goldbloom","id":"555329200"},{"name":"Gabi Perry","id":"559148860"},{"name":"Yoni Shtein","id":"560091387"},{"name":"Amit Apple","id":"563538726"},{"name":"Avi Carmon","id":"581266131"},{"name":"Raviv Tamir","id":"594729116"},{"name":"Revital Ben-Hamo","id":"617232453"},{"name":"Gilad Elyashar","id":"625611013"},{"name":"Ariela Boursi","id":"628311325"},{"name":"Ilay Roitman","id":"634048237"},{"name":"Dror Cohen","id":"670223584"},{"name":"Eran Gonen","id":"674748651"},{"name":"Shahar Yekutiel","id":"680956963"},{"name":"Ravit Tal","id":"685176459"},{"name":"Zack Dvey-Aharon","id":"691683727"},{"name":"Eran Shahar","id":"700493001"},{"name":"Chen Tsofi","id":"708162492"},{"name":"Eyal Badash","id":"708591957"},{"name":"Ran Levitzky","id":"712741345"},{"name":"Polina Krimshtein","id":"741780149"},{"name":"Ami Turgman","id":"744673514"},{"name":"Revital Barletz","id":"744777534"},{"name":"Itai Frenkel","id":"747008278"},{"name":"Einam Schonberg","id":"758049829"},{"name":"Sharon Gingold","id":"776872499"},{"name":"Edo Yahav","id":"809953065"},{"name":"Avigad Oron","id":"832032368"},{"name":"Oded Nahir","id":"1032228138"},{"name":"Shai Ber","id":"100000404810108"},{"name":"Noam Keidar","id":"100000454296282"},{"name":"Alexander Sloutsky","id":"100001315798911"},{"name":"Ron Dar Ziv","id":"100001779702520"},{"name":"Sivan Krigsman","id":"100001873082153"},{"name":"Yoav Helfman","id":"100002066173780"}],
  me: {"name":"Elad Ben-Israel","id":"620032"}
};*/

$(function() {

  var cid = null;
  var name = null;

  function after_login() {
    startWatch();
    FB.api('/me', function(response) {
      name = response.name;
      cid = response.id;

      FB.api('/me/friends', function(friendsData) {
        showFriends(friendsData.data);
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


    // The watch id references the current `watchAcceleration`
    var watchID = null;
    
   // Start watching the acceleration
   function startWatch() {
      alert("startWatch");
      if (!('accelerometer' in navigator)) {
        console.log('no accelerometer')
        return;
      }

      var previousReading = {
          x: null,
          y: null,
          z: null
      }

      watchID = navigator.accelerometer.watchAcceleration(function (acceleration) {
        var changes = {};
        bound =15;
        
        //alert("isShaken " + isShaken );

        if (previousReading.x !== null) {
            changes.x = Math.abs(previousReading.x - acceleration.x);
            changes.y = Math.abs(previousReading.y - acceleration.y);
            changes.z = Math.abs(previousReading.z - acceleration.z);

            //alert("changes " + changes.x +","+changes.y+","+changes.z );
            //alert("changes " + changes.x);

            //if (changes.x > bound && changes.y > bound && changes.z > bound) {
            if (changes.x > bound && changes.y > bound) {
              //alert("changes " + changes.y);
              shaken();
            }
        }
        
          previousReading = {
          x: acceleration.x,
          y: acceleration.y,
          z: acceleration.z
        
      }
        
        }, onError, { frequency: 100 });
  }

  function shaken(){
      navigator.accelerometer.clearWatch(watchID);
      navigator.notification.vibrate(2500);
      pair();
      startWatch();
  }

  // Error
  function onError() {
      alert('onError!');
  }

  var layer = createLayer();
  var canvas = $('canvas')[0];

  function pair() {
    if (!cid || !name) {
      console.error('still not logged in');
      return;
    }
    
    //if (development) {
<<<<<<< HEAD
    //  showFriends(development.friends);
    //  return; 
=======
      //showFriends(development.friends);
      //return; 
>>>>>>> fixing issues and integrating with Leon
    //}

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
                //showFriends(friends);
                // Find shared friends and drop them
                friends.forEach(function(friend) {
                  Object.keys(layer._objects).forEach(function(key){
                    if (friend.id == layer._objects[key].fbid) { layer._objects[key].ondrop(); };
                  });  
                });
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

  
  canvasize(canvas, layer);

  function showMyImage() {
    var meid = development ? development.me.id : 'me';
    FB.api('/' + meid + '/picture', function(imageURL) {
      var meImage = new Image();
      meImage.src = imageURL;
      meImage.onload = function() {
        var w = meImage.width * 2;
        var obj = createPolaroid(meImage, 50, 50, w);

        // setInterval(function() {
        //   var w = obj.width();
        //   var h = obj.height();
        //   var r = obj.rotate && (obj.rotate() || 0.0);

        //   obj.width = function() { return w + 10 };
        //   obj.height = function() { return h + 10 };
        //   obj.rotate = function() { return r + 0.1 };

        // }, 50);

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
        
        var deg = Math.random()*360 - 180;
        x = Math.floor(Math.random() * (canvas.width - 50) + 25);
        y = Math.floor(Math.random() * (canvas.height - 200) + 25);

        // var obj = createImage(img, x, y, SZ, SZ, null, deg);
        var obj = createPolaroid(img, x, y, SZ, friend.name, null, deg, friend.id);
      
        obj.friend = friend;
        obj.src = img.src;
        obj.state = 'out';
        friends.bigImg = null;      
        var context = canvas.getContext('2d'); 

        function openImage() {
          obj.bringToTop();
          obj.deg = 0;

          var centerX = obj.x() + obj.width() / 2;
          var centerY = obj.y() + obj.height() / 2;          
          
          var v = 10;

          var iv = setInterval(function() {
            var m = obj.state === 'out' ? 1 : -1;
            if (friends.bigImg && friends.bigImg != obj) {
              friends.bigImg.onclick = null;
              friends.bigImg.xlength -= v;
              //friends.bigImg.height -= v;
              if (friends.bigImg.width() <= SZ) {
                friends.bigImg.xlength = SZ;
                //friends.bigImg.height = SZ;
                clearInterval(iv);
                friends.bigImg.onclick = openImage;
                friends.bigImg.state = 'out';
              }
            }

            obj.xlength += v * m;
            //obj.height += v * m;
            //obj.onclick = null;
            obj.xcoor = centerX - obj.width() / 2;
            obj.ycoor = centerY - obj.height() / 2;

            if (obj.width() >= 200) {
              obj.xlength = 200;
              //obj.height = 200;
              clearInterval(iv);
              obj.onclick = openImage;
              friends.bigImg = obj;
              obj.state = 'in';
            }

            if (obj.width() <= SZ) {
              obj.xlength = SZ;
              //obj.height = SZ;
              clearInterval(iv);
              obj.onclick = openImage;            
              friends.bigImg = null;
              obj.state = 'out';
            }
          }, 10);
        };
        
        function shakeImage() {
          obj.bringToTop();
          obj.deg = 45;
          var counter = 0;

          var iv = setInterval(function() {
            // Shake
            obj.deg *= -1;
            counter++;
            if (counter >= 20) { //2 secs
              obj.deg = 0;
              clearInterval(iv);
              dropImage();
            }
          }, 10);
        };

        function dropImage() {
          obj.bringToTop();

          var iv = setInterval(function() {
            obj.ycoor += 
              //(obj.height / 2) +
              25 +  
              (obj.ycoor / 7); //Acceleration

            obj.alpha -= 0.1  
            if (obj.ycoor + obj.height() >= canvas.height) {
              clearInterval(iv);
              obj.visible = false;
            } 
          }, 30);
        };

        obj.onclick = openImage;        
        obj.ondrop = shakeImage;

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
    refreshButton = createImage(refreshImage, canvas.width / 3, canvas.height - 70, 50, 50);
    refreshButton.onclick = function() {
      window.location.reload();
    };
    layer.add(refreshButton);
  };

  var pairImage = new Image();
  pairImage.src = 'img/search.png';
  var pairButton = null;
  pairImage.onload = function() {
    console.log('adding pair');
    pairButton = createImage(pairImage, canvas.width / 3 * 2, canvas.height - 70, 50, 50);
    pairButton.onclick = function() {
      console.log('pairing...');
      pair();
    };
    layer.add(pairButton);
  };

});

function createText(view) {
  var self = createView(view);
  self.ondraw = function(ctx) {
    if (self.text) {
      ctx.fillText(self.text, 0, 0, self.width());
    }
  };
  return self;
}

function createPolaroid(im, x, y, width, label, alpha, deg, fbid) {

  var rect = createRectangleView({ 
    xlength: width,
    width: function() 
    { 
      var self = this;
      return self.xlength; 
    },
    height: function() 
    { 
      var self = this;
      return self.width() * (10 / 7); 
    },

    xcoor: x,
    ycoor: y,
    fillStyle: 'white',
    shadowBlur: 5.0,
    shadowColor: 'black',
    shadowOffsetX: 1.0,
    shadowOffsetY: 1.0,
    radius: 3,
    deg: deg,

    x: function() 
    { 
      var self = this;
      return self.xcoor; 
    },

    y: function() 
    { 
      var self = this;
      return self.ycoor; 
    },

    rotate: function() 
    { 
      var self = this;
      return self.deg; 
    },

    fbid: fbid,
    alpha: alpha,
  });

  var photo = createImageView({
    img: im,
    x: function() { return rect.width() / 2 - rect.width() * 0.8 / 2; },
    y: function() { return rect.height() / 2.5 - rect.height() * 0.65 / 2; },
    width: function() { return rect.width() * 0.8; },
    height: function() { return rect.height() * 0.65; },
  });

  rect.add(photo);

  var frame = createRectangleView({
    x: function() { return 0; },
    y: function() { return 0; },
    width: function() { return photo.width(); },
    height: function() { return photo.height(); },
    strokeStyle: 'black',
    lineWidth: 1,
    radius: 1,
  });

  photo.add(frame);

  var text = createText({
    x: function() { return photo.x(); },
    y: function() { return rect.height() - 5; },
    width: function() { return photo.width() - 5; },
    height: function() { return 0; },
    text: label,
  });

  rect.add(text);

  return rect;
}
