var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('http');
var crypto = require('crypto');


//params for requesting the offerwall
var security_token = "332349b0cb9bd37c7ec67095de9046fb";
var security_token_ios = "8032a4560f974357f92acdfa4a97a56d"
var userId = "";
var os;

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

var varifyParams = function(required_params, params){
	for(var i in required_params){
		var parameter = required_params[i];
		if(!params[parameter]){
			return false;
		}
	}
	return true;
}

//universal function for emitting data to socket connection later it will replaced by socket on connection event
var rewardUser = (rewardedUser, amount, currency) => { };

//callback request when offer is completed
app.get('/reward', function (req, res) {
	res.sendStatus(200);
	var rewardedUser = req.query.uid;
	var amount = req.query.amount;
	var currency = req.query.currency_id;
	var sid = req.query.sid;
	sid_string = ''
	sid_string += (os == 'iOS' || os == 'macOS') ? security_token_ios : security_token;
	sid_string += rewardedUser;
	sid_string += amount;
	sid_string = getSHA1(sid_string);
	if (sid_string == sid) {
		rewardUser(rewardedUser, amount, currency);
	}
});





io.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('getOffer', function (data) {
		if(!varifyParams(['os', 'appid', 'appidios', 'apiKeyios', 'apiKey', 'uid', 'locale', 'google_ad_id', 'google_ad_id_limited_tracking_enabled'], data)){
			return null;
		}
		var appid="";
		var apiKey="";
		//sperate offer for android and ios
		if (data.os == 'iOS' || data.os == 'macOS') {
			appid = 'appid=' + data.appidios + '&';
			apiKey = data.apiKeyios
		}
		else {
			appid = 'appid=' + data.appid + '&';
			apiKey = data.apiKey;
		}
		var ip = '';
		if (socket.request.connection.remoteAddress != '127.0.0.1') {
			ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
			ip = 'ip=' + ip + '&'
		}
		userId = data.uid;
		//params for accessing fyber api
		var uid = 'uid=' + data.uid + '&';
		console.log(ip);
		os = data.os;
		var format = "format=json&"
		var locale = "locale="+data.locale+"&os_version=9.0&"
		var googleID = "google_ad_id=" + data.google_ad_id + "&";
		var tracker = "google_ad_id_limited_tracking_enabled=" + data.google_ad_id_limited_tracking_enabled + "&";
		var timestamp = 'timestamp=' + parseInt(Date.now() / 1000) + '&';
		var params = appid + format + googleID + tracker + ip + locale + timestamp + uid;
		var hashkey = 'hashkey=' + getSHA1(params + apiKey);
		params = params + hashkey;
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
			socket.emit(userId, str);
		});
	}

	rewardUser = function (rewardedUser, amount, currency) {
		var emitter = 'reward' + rewardedUser;
		socket.emit(emitter, { amount: amount, currency: currency });
	}
});

app.use(express.static(__dirname + '/buildfire'));




//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
	host: 'api.fyber.com',
	path: '/feed/v1/offers.json?'
};