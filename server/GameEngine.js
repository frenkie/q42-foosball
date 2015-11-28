
var Tracker;
if ( process.env.PYTHON_TRACKER ) {
    Tracker = require('./trackers/PythonCamTracker');
} else if ( ! process.env.NOTRACK ) {
    Tracker = require('./trackers/CamTracker');
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

    this.themes = ['default', 'Tron', 'grass', 'grass2'];
    this.currentTheme = 0;
    this.frenzyThreshold = 3;

    if ( Tracker ) {
        this.tracker = new Tracker();
        this.bindTrackerEvents();
        this.tracker.start();
    }
};

GameEngine.prototype = {

    bindSocketEvents: function () {

        this.socket.on('connection', function ( client ) {

            var stats;

            console.log('connected!');

            // Gameplay
            client.on('score-left', this.handleScoreLeft.bind( this ) );
            client.on('score-right', this.handleScoreRight.bind( this ) );

            client.on('subtract-score-left', this.handleSubtractScoreLeft.bind( this ) );
            client.on('subtract-score-right', this.handleSubtractScoreRight.bind( this ) );

            client.on('reset-game', this.handleResetGame.bind( this ) );

            client.on('get-themes', this.handleGetThemes.bind( this ) );
            client.on('get-current-theme', this.handleGetCurrentTheme.bind( this ) );
            client.on('change-theme', this.handleChangeTheme.bind( this ) );
            client.on('cycle-theme', this.handleCycleTheme.bind( this ) );

            // Admin
            client.on('request-hsv', this.handleRequestHSV.bind( this ) );
            client.on('table-bounds', this.handleTableBounds.bind( this ) );
            client.on('ball-positions', this.handleBallPositions.bind( this ) );


          // Send stats
            stats = {
                state: this.state
            };

            if ( this.tracker ) {
                stats.tableDimensions = this.tracker.getTableDimensions();

                if ( this.tracker.getTableBounds() ) {
                    stats.tableBounds = this.tracker.getTableBounds();
                }
            }

            client.emit('stats', stats);            
            
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

        this.socket.emit('score-left', this.state.score );
        this.socket.emit('score-update', this.state.score );

        this.handleFrenzy("left");
    },

    handleScoreRight: function () {
        this.state.score.right++;
        console.log('right scored: ' + this.state.score.right);

        this.socket.emit('score-right', this.state.score);
        this.socket.emit('score-update', this.state.score );

        this.handleFrenzy("right");
    },

    handleSetLowerBallThreshold: function () {

    },

    handleSetUpperBallThreshold: function () {

    },

    handleSubtractScoreLeft: function () {
        this.state.score.left--;
        if (this.state.score.left < 0){
            this.state.score.left = 0;
        }
        console.log('left score subtracted: ' + this.state.score.left);

        this.socket.emit('score-right', this.state.score );
        this.socket.emit('score-update', this.state.score );
    },

    handleSubtractScoreRight: function () {
        this.state.score.right--;
        if (this.state.score.right < 0){
            this.state.score.right = 0;
        }
        console.log('right score subtracted: ' + this.state.score.right);

        this.socket.emit('score-left', this.state.score );
        this.socket.emit('score-update', this.state.score );
    },

    handleFrenzy: function( team ) {

        if ( team == this.state.lastScorer ) {

            this.state.score.frenzy++;
            if ( this.state.score.frenzy >= this.frenzyThreshold ) {
                this.socket.emit('frenzy', team, true);
                console.log('frenzy '+ team, true);
            }

        } else {
            this.state.score.frenzy = 0;
            this.socket.emit('frenzy', this.state.lastScorer, false);
            console.log('frenzy '+ this.state.lastScorer, false);
        }

        this.state.lastScorer = team;

    },

    handleTableBounds: function ( bounds ) {
        console.log('bounds');
        this.tracker.setTableBounds( bounds );
    },

    handleResetGame: function () {
        this.resetGame();
        this.socket.emit('reset-game');
    },

    resetGame: function () {
        console.log('reset game');
        this.state = {
            positions: [],
            score: {
                left: 0,
                right: 0,
                frenzy: 0
            }
        };
    },

    handleGetThemes: function ( ) {
        this.socket.emit('get-themes', this.themes);
        console.log('get themes: ', this.themes);
    },

    handleGetCurrentTheme: function ( ) {
        this.socket.emit('get-current-theme', this.currentTheme);
        console.log('get current theme: ' + this.themes[this.currentTheme]);
    },

    handleChangeTheme: function ( index ) {
        this.socket.emit('change-theme', index);
        console.log('theme changed: ' + this.themes[index]);
        this.currentTheme = index;
    },

    handleCycleTheme: function ( ) {
        this.currentTheme = this.currentTheme + 1;

        if (this.currentTheme >= this.themes.length -1 ){
            this.currentTheme = 0;
        }
        console.log('theme cycled: ' + this.themes[this.currentTheme]);
        this.socket.emit('change-theme', this.currentTheme);
    }
};

module.exports = GameEngine;