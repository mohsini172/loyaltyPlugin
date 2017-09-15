// Paymentwall Node.JS Library: https://www.paymentwall.com/lib/node
var Paymentwall = require('paymentwall');
var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var http = require('http');
var crypto = require('crypto');


Paymentwall.Configure(
  Paymentwall.Base.API_VC,
  'ad395761885bf86413f25ac0c5ff5c73',
  '3bc987ae58c2fe434f8a4b83abcd9c2f'
);


app.get('/', function(req, res) {
	var pingback = new Paymentwall.Pingback(req.query, req.headers['x-forwarded-for'] || req.connection.remoteAddress);
	if (pingback.validate()) {
	  var virtualCurrency = pingback.getVirtualCurrencyAmount();
	  if (pingback.isDeliverable()) {
	    // deliver the virtual currency
	  } else if (pingback.isCancelable()) {
	    // withdraw the virtual currency
	  } 
	  console.log('OK');
	  res.send('OK');
	} else {
	  console.log(pingback.getErrorSummary());
	}
})

var server_port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

// start server on the specified port and binding host
server.listen(server_port, server_ip_address, function () {
	// print a message when the server starts listening
	console.log("server starting on " + server_port);
});