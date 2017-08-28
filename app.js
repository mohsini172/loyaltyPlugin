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
var apiKey = "3c548e669647a891d9fd543a12721216897ca63b";
var userId = "";
var security_token = "332349b0cb9bd37c7ec67095de9046fb";



var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// start server on the specified port and binding host
server.listen(server_port, server_ip_address, function () {
	// print a message when the server starts listening
	console.log("server starting on " + server_port);
});

var getSHA1 = function (input) {
	return crypto.createHash('sha1').update(input).digest('hex')
}

//universal function for emitting data to socket connection later it will replaced by socket on connection event
var rewardUser = (rewardedUser, amount, currency) => { };

//callback request when offer is completed
app.get('/reward', function (req, res) {
	res.sendStatus(200);
	var rewardedUser = req.query.uid;
	var amount = req.query.amount;
	var currency = req.query.currency_id;
	rewardUser(rewardedUser, amount, currency);
});





io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('getOffer', function (data) {
		//sperate offer for android and ios
		if (data.os == 'iOS' || data.os == 'macOS') {
			appid = 'appid=' + data.appid + '&';
			apiKey = apiKeyios
		}
		else {
			appid = 'appid=' + data.appid + '&';
			apiKey = data.apiKey;
		}
		uid = 'uid=' + data.uid + '&';
		var ip = (socket.handshake.address != '127.0.0.1') ? ('ip=' + socket.handshake.address + '&') : '';
		userId = data.uid;
		googleID = "google_ad_id=" + data.google_ad_id + "&";
		tracker = "google_ad_id_limited_tracking_enabled=" + data.google_ad_id_limited_tracking_enabled + "&";
		var timestamp = 'timestamp=' + parseInt(Date.now() / 1000) + '&';
		var params = appid + format + googleID + tracker + ip + locale + timestamp + uid;
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

	rewardUser = function (rewardedUser, amount, currency) {
		var emitter = 'reward' + rewardedUser;
		console.log(emitter);
		socket.emit(emitter, { amount: amount, currency: currency });
	}
});

app.use(express.static(__dirname + '/buildfire'));




//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
	host: 'api.fyber.com',
	path: '/feed/v1/offers.json?'
};