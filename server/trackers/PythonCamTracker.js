var EventEmitter = require('events').EventEmitter;
var extend = require('extend');
var Q = require('q');
var spawn = require( 'child_process' ).spawn;
var util = require('util');

var TABLE_DIMENSIONS = { length: 120, height: 68 }; // in cm's
var TABLE_BOUNDS; // when there is a cut out of the webcam

var PythonCamTracker = function () {

    EventEmitter.call(this);

    this.points = [];
    this.tracking = false;
};

util.inherits(PythonCamTracker, EventEmitter);


extend(PythonCamTracker.prototype, {

    getTableBounds: function () {
        return TABLE_BOUNDS;
    },

    getTableDimensions: function () {
        return TABLE_DIMENSIONS;
    },

    handlePosition: function ( position ) {

        if ( this.points.length === 10 ) {
            this.points.pop();
        }
        this.points.unshift( position );

        this.emit('ball-positions', this.points );
    },

    handleTrackerOutput: function ( output ) {
        if ( output ) {
            output = output.toString();
            if ( /ball-position:/i.test( output ) ) {
                var position = output.split('ball-position:' )[1];
                position = JSON.parse('{'+ position +'}');

                this.handlePosition( position );
            }
        }
    },

    start: function () {
        this.tracking = true;

        this.track();
    },

    stop: function () {
        this.tracking = false;
    },

    track: function () {

        var spawnArguments = ['../python-trackers/ball_tracking.py'];
        if ( process.env.PYTHON_TRACKER === 'kinect' ) {
            spawnArguments.push('--kinect');
        }

        this.pythonTracker = spawn( 'python', spawnArguments );
        this.pythonTracker.stderr.on('data', this.handleTrackerOutput.bind( this ));
    }
});

module.exports = PythonCamTracker;