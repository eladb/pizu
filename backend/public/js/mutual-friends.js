///<reference path="facebook_js_sdk.js" />
///<reference path="jquery-1.7.2.min.js" />
///<reference path="cordova-1.7.0.js" />
///<reference path="cdv-plugin-fb-connect.js" />
///<reference path="geohash.js" />

//var urlparse = require('url').parse;
var APP_ID = '146577522141106';


var cid = null;
var name = null;

$(function () {
    console.log("Mutual friends script");
    function after_login() {
        FB.api('/me', function (response) {
            name = response.name;
            cid = response.id;
        });
        function gup(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(window.location.href);
            if (results == null) return "";
            else return results[1];
        }

        /// Do the mutual friends presentation  //TODO: make into its own function

        //var purl = urlparse(location.href, true);
        var otherid = gup("otherid");

        //var otherid = purl.query.otherid;

        var graph = '/me/mutualfriends/' + otherid;

        FB.api(graph, function (res) {
            console.log('response:' + JSON.stringify(res));
            var friends = res.data;

            var h = $('ul.slider');
            $('#dvProgress').css("visibility", "hidden");
            h.empty();
            friends.forEach(function (friend) {
                var firstName = friend.name.split(" ")[0];
                var line = "<li><img src=\"https://graph.facebook.com/" + friend.id + "/picture?type=large\"><h2>" + firstName + "</h2></li>";
                h.append(line);

                friend.id;
            });

            $('#slider').movingBoxes({
                startPanel: 1,      // start with this panel
                wrap: true,   // if true, the panel will "wrap" (it really rewinds/fast forwards) at the ends
                buildNav: false,   // if true, navigation links will be added
                navFormatter: function () { return "&#9679;"; } // function which returns the navigation text for each panel
            });

        });

    }

    var browser =
    navigator.userAgent.indexOf('Chrome') !== -1;

    if (browser) {
        // for browsers
        FB.init({ appId: APP_ID, cookie: true });
        FB.getLoginStatus(function (s) {
            if (s.status !== 'connected') {
                return FB.login(after_login);
            }
            else {
                return after_login();
            }
        });
    }

    // phonegap initialization
    document.addEventListener("deviceready", function () {
        CDV.FB.init(APP_ID);
        CDV.FB.getLoginStatus(function (s) {
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


      





