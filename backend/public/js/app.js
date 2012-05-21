$(function() {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '146577522141106', // App ID
      channelUrl : '//pizu.hackingonstuff.net/channel.html', // Channel File
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });

    console.log('FB init');

    FB.login(function(response) {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function(response) {
          $('#name').attr('value', response.name);
          $('#cid').attr('value', response.id);
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });

    // FB.getLoginStatus(function(res) {
    //   console.log('res:', res);
    //   handle_login();
    // });

    // FB.Event.subscribe('auth.login', handle_login);

    // function handle_login() {
    //   console.log('handle_login');
    //   FB.api('/me', function(response) {
    //     console.log('Good to see you, ' + response.name + '.');
    //   });
    // }
  };

  // Load the SDK Asynchronously
  (function(d){
     var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement('script'); js.id = id; js.async = true;
     js.src = "//connect.facebook.net/en_US/all.js";
     ref.parentNode.insertBefore(js, ref);
   }(document));



  $('#refresh').click(function() {
    window.location.reload();
  });


  $('#pair').click(function(e) {
    e.preventDefault();

    if ($('#pair').hasClass('disabled')) {
      return;
    }

    var name = $('#name').attr('value');
    var cid = $('#cid').attr('value');

    console.log('name=%s cid=%d', name, cid);

    var url = '/?sid=1&cid=' + cid;

    $('#pair').addClass('disabled');

    $.ajax({
      type: 'post',
      url: url,
      data: { name: name },
    }).done(function(payload) {
      console.log('payload:', payload);

      $('#pair').removeClass('disabled');
      
      for (var k in payload) {
        console.log('k=', k);
        if (k != cid) {
          console.log('found other payload:', payload[k]);
          $('#other').html(payload[k].name);
        }
      }
    }).fail(function(jqxhr, textStatus, body) {
      $('#pair').removeClass('disabled');
      alert(body);
    });
  })
});