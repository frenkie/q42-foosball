var express = require('express'); // Docs http://expressjs.com/
var config = require('../config.json');

var app = express();
var server = require('http').Server( app );

var port = config.controller.port;


app.get( '/config.js', function ( req, res ) {
    res.set('Content-Type', 'application/javascript');
    res.send('var config = '+ JSON.stringify( config ) +';' );
});

app.use(express.static( __dirname ));

    // binding to 0.0.0.0 allows connections from any other computer in the network
    // to your ip address
server.listen( port, '0.0.0.0', function () {

    console.log('game controller started on localhost:'+ port );
} );