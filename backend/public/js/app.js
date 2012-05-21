$(function() {
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