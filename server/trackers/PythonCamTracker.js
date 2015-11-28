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

    handleTrackerOutput: function ( output ) {
        if ( output ) {
            console.log( 'data from python', output.toSting() );
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
        this.pythonTracker.stdout.on('data', this.handleTrackerOutput.bind( this ));
        this.pythonTracker.stderr.on('data', function (data) {
            console.log('python stderr: ' + data);
        });
    }
});

module.exports = PythonCamTracker;