
var Tracker;
if ( ! process.env.NOTRACK ) {
    Tracker = require('./trackers/CamTracker')
}

/**
 * Server-side game engine implementation
 * @param {Socket.io} socket
 * @constructor
 */

var GameEngine = function ( socket ) {


    this.resetGame();

    this.socket = socket;

    this.bindSocketEvents();

    if ( Tracker ) {
        this.tracker = new Tracker();
        this.bindTrackerEvents();
        this.tracker.start();
    }
};

GameEngine.prototype = {

    bindSocketEvents: function () {

        this.socket.on('connection', function ( client ) {

            console.log('connected!');

            // Admin
            client.on('request-hsv', this.handleRequestHSV.bind( this ) );
            client.on('table-bounds', this.handleTableBounds.bind( this ) );
            client.on('ball-positions', this.handleBallPositions.bind( this ) );

            client.on('score-left', this.handleScoreLeft.bind( this ) );
            client.on('score-right', this.handleScoreRight.bind( this ) );

            client.on('reset-game', this.resetGame.bind( this ) );


        }.bind( this ) );

    },

    bindTrackerEvents: function () {

        this.tracker.on('frame', this.emitFrameGrab.bind( this ) );
        this.tracker.on('mask', this.emitMaskGrab.bind( this ) );
        this.tracker.on('ball-positions', this.handleBallPositions.bind( this ) );

    },

    emitFrameGrab: function ( frameBuffer ) {
        this.socket.emit('frame', frameBuffer );
    },

    emitMaskGrab: function ( frameBuffer ) {
        this.socket.emit('mask', frameBuffer );
    },

    handleBallPositions : function ( data ) {
        //console.log( 'ball-positions', data );

        this.state.positions = data;

        this.socket.emit( 'ball-positions', data );
    },

    handleRequestHSV: function ( position ) {

        this.tracker.getHSVForPosition( position ).then( function ( hsv ) {
            this.socket.emit('get-hsv', hsv);
        }.bind( this ) );
    },

    handleScoreLeft: function () {
        this.state.score.left++;
        console.log('left scored: ' + this.state.score.left);

        this.socket.emit('score-right', this.state.score );
        this.socket.emit('score-update', this.state.score );
    },

    handleScoreRight: function () {
        this.state.score.right++;
        console.log('right scored: ' + this.state.score.right);

        this.socket.emit('score-left', this.state.score);
        this.socket.emit('score-update', this.state.score );
    },

    handleTableBounds: function ( bounds ) {
        console.log('bounds');
        this.tracker.setTableBounds( bounds );
    },

    resetGame: function () {
        console.log('reset game');
        this.state = {
            positions: [],
            score: {
                left: 0,
                right: 0
            }
        };
    }
};

module.exports = GameEngine;