var APP_ID = '146577522141106';

$(function() {

  $('#content').hide();

  function after_login() {
    FB.api('/me', function(response) {
      $('#name').attr('value', response.name);
      $('#cid').attr('value', response.id);
      $('#content').show();
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


  $('#pair').click(function(e) {
    e.preventDefault();

    if ($('#pair').hasClass('disabled')) {
      return;
    }

    var name = $('#name').attr('value');
    var cid = $('#cid').attr('value');

    if (navigator.geolocation) 
    {
        navigator.geolocation.getCurrentPosition( 
 
        function (position) {  
 
        console.log(position);

        var geoHash = encodeGeoHash(position.coords.latitude, position.coords.longitude);
        console.log('geoHash: ' + geoHash);
        alert('Hash:' + geoHash);
        // Take the first 7 chars to have an accuracy of ~70 meters
        geoHash = geohash.slice(0,7);

        console.log('geoHash after slice: ' + geoHash);
        console.log('name=%s cid=%d', name, cid);
        alert('Lan:' + position.coords.latitude + ' Lon:' + position.coords.longitude + ' Hash:' + geoHash);

        var url = '/?sid=' + geoHash + '&cid=' + cid;

        $('#pair').addClass('disabled');

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
              console.log(graph);
              
              $('#mutual').empty();

              FB.api(graph, function(res) {
                console.log('response:'+JSON.stringify(res));
                res.data.forEach(function(friend) {
                  var imgsrc = 'https://graph.facebook.com/' + friend.id + '/picture';
                  var li = $('<li><img src="' + imgsrc + '">' + friend.name + '</li>');
                  $('#mutual').append(li);
                });
              });
            }
          }
        }).fail(function(jqxhr, textStatus, body) {
          $('#pair').removeClass('disabled');
          alert(body);
        });
    
        }, 
        // next function is the error callback
        function (error)
        {
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
        }
        );
      }
    //}
    //else // finish the error checking if the client is not compliant with the spec

    
  });
});
