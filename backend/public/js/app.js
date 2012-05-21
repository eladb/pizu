
$(function() {

  function onDeviceReady() {
    var APP_ID = '146577522141106';
    CDV.FB.init(APP_ID);
    setTimeout(function() {
      CDV.FB.login(null, function() {
        FB.api('/me', function(response) {
          $('#name').attr('value', response.name);
          $('#cid').attr('value', response.id);
        });
      });
    }, 2000);
    
  }

  document.addEventListener("deviceready", onDeviceReady, false);

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
  });
});
