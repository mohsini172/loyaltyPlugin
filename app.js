var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('http');
var crypto = require('crypto');


//params for requesting the offerwall
var appid = "appid=106186&"
var format = "format=json&"
var googleID = "google_ad_id=2E7CE4B3-F68A-44D9-A923-F4E48D92B31E&google_ad_id_limited_tracking_enabled=false&"
var locale = "locale=en&os_version=9.0&"
var timestamp = "timestamp=1503159710&"
var uid = "uid=player&"
var hashkey = "hashkey=b4dd3ecf31ddda9d3bbac29abf2f6a933419fb1f";
var apiKey = "3c548e669647a891d9fd543a12721216897ca63b"
var userId = "";



var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

// start server on the specified port and binding host
server.listen(server_port, server_ip_address, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

var getSHA1 = function (input) {
	return crypto.createHash('sha1').update(input).digest('hex')
}

io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('getOffer', function (data) {
		appid = 'appid='+data.appid + '&';
		uid = 'uid=' + data.uid + '&';
		userId = data.uid;
		googleID = "google_ad_id="+data.google_ad_id+"&";
		tracker = "google_ad_id_limited_tracking_enabled="+data.google_ad_id_limited_tracking_enabled+"&";
		apiKey = data.apiKey;
		var timestamp = 'timestamp=' + parseInt(Date.now() / 1000) + '&';
		var params = appid + format + googleID + tracker + locale + timestamp + uid;
		var hashkey = getSHA1(params + apiKey);
		hashkey = 'hashkey=' + hashkey;
		params = params + hashkey;
		console.log(params);
		options.path += params;
		http.request(options, callback).end();
	});
	callback = function (response) {
		var str = '';

		//another chunk of data has been recieved, so append it to `str`
		response.on('data', function (chunk) {
			str += chunk;
		});

		//the whole response has been recieved, so we just print it out here
		response.on('end', function () {
			console.log("repsonse aaya hai");
			socket.emit(userId, str);
		});
	}
});

app.use(express.static(__dirname + '/buildfire'));




//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
	host: 'api.fyber.com',
	path: '/feed/v1/offers.json?'
};