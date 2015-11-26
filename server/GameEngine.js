/**
 * Server-side game engine implementation
 * @param {Socket.io} socket
 * @constructor
 */

var GameEngine = function ( socket ) {

    this.socket = socket;

    this.bindSocketEvents();
};

GameEngine.prototype = {

    bindSocketEvents: function () {

        this.socket.on('connection', function ( client ) {

            console.log('connected!');

            client.on('ball-position', this.handleBallPosition.bind( this ) );
            client.on('scored', this.handleScored.bind( this ) );

        }.bind( this ) );

    },

    handleBallPosition : function ( data ) {
        console.log( 'ball-position', data );
        this.socket.emit( 'ball-position' );
    },

    handleScored : function () {
        console.log( 'scored', data );
        this.socket.emit( 'scored' );
    }
};

module.exports = GameEngine;