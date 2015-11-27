var ballColor = require('./ballColors').speedball;
var EventEmitter = require('events').EventEmitter;
var extend = require('extend');
var cv = require('opencv');
var Q = require('q');
var util = require('util');


var GREEN = [0, 255, 0]; // B, G, R

var TABLE_DIMENSIONS = { length: 150, height: 75 }; // in cm's
var TABLE_BOUNDS; // when there is a cut out of the webcam


var CamTracker = function () {
    EventEmitter.call(this);

    this.frameCount = 0;
    this.startTime;
    this.points = [];

    this.resetBallThreshold();
    
    this.camera = new cv.VideoCapture(1);
    this.camera.setWidth(320);
    this.camera.setHeight(180);

    this.tracking = false;
};

util.inherits(CamTracker, EventEmitter);


extend(CamTracker.prototype, {

    getCenterPoint: function (contours, testIm) {

        var largestArea = 0;
        var idx = -1;

        for (var i = 0; i < contours.size(); i++) {
            if ( contours.area(i) > largestArea ) {
                largestArea = contours.area(i);
                idx = i;
            }
        }

        if ( idx > -1 ) {

            var rect = contours.minAreaRect(idx);
            var radius = 0;

            if ( rect ) {

                radius = Math.max( rect.size.width, rect.size.height ) / 2 / 2; //?? why divided by 4?
            }

            var moments = contours.moments(idx);
            var center = {
                x: Math.round(moments.m10 / moments.m00),
                y: Math.round(moments.m01 / moments.m00),
                radius: radius
            };

            testIm.ellipse( center.x, center.y, radius * 2, radius * 2, GREEN );

            // translate center to physical position
            if ( TABLE_BOUNDS ) {
                center.x = center.x + TABLE_BOUNDS.x;
                center.y = center.y + TABLE_BOUNDS.y;
            }


            center.x = Math.floor( ( center.x / testIm.width() ) * TABLE_DIMENSIONS.length );
            center.y = Math.floor( ( center.y / testIm.height() ) * TABLE_DIMENSIONS.height );
            center.radius = Math.floor( ( center.radius / testIm.height() ) * TABLE_DIMENSIONS.height );

            return center;
        }
    },

    getHSVForPosition: function (position) {

        var deferred = Q.defer();

        this.camera.read(function (err, im) {

            im.convertHSVscale();

            deferred.resolve(im.pixel(position.y, position.x));
        });

        return deferred.promise;
    },

    resetBallThreshold: function () {
        this.lowerThreshold = [ballColor.lower[0], ballColor.lower[1], ballColor.lower[2]];
        this.upperThreshold = [ballColor.upper[0], ballColor.upper[1], ballColor.upper[2]];
    },

    setLowerBallThreshold: function ( to ) {
        this.lowerThreshold = [ to[0], to[1], to[2] ];
    },

    setTableBounds: function ( bounds ) {
        TABLE_BOUNDS = bounds;
    },

    setUpperBallThreshold: function ( to ) {
        this.upperThreshold = [ to[0], to[1], to[2] ];
    },
    
    start: function () {
        this.tracking = true;

        this.frameCount = 0;
        this.startTime = Date.now();

        this.track();
    },

    stop: function () {
        this.tracking = false;
    },

    track: function () {
        if (this.tracking) {

            this.camera.read(function (err, im) {

                var mask;
                var big = new cv.Matrix( im.height(), im.width() );
                var contours;
                var centerPoint;

                mask = im.copy();

                if ( TABLE_BOUNDS ) {
                    mask = mask.roi(TABLE_BOUNDS.x, TABLE_BOUNDS.y, TABLE_BOUNDS.width, TABLE_BOUNDS.height);
                }

                mask.convertHSVscale();
                mask.inRange(this.lowerThreshold, this.upperThreshold);
                mask.erode(2);
                mask.dilate(2);

                contours = mask.findContours();

                if ( contours && contours.size() ) {
                    centerPoint = this.getCenterPoint(contours, im);

                    if (centerPoint) {
                        if (this.points.length === 10) {
                            this.points.pop();
                        }
                        this.points.unshift(centerPoint);

                        this.emit('ball-positions', this.points );
                    }
                }

                // TODO if TABLE_BOUNDS is set, big image should have different size...
                big.drawAllContours(contours, GREEN);

                this.emit('frame', {buffer: im.toBuffer()});
                this.emit('mask', {buffer: big.toBuffer()});

                //this.frameCount++;
                //console.log( this.frameCount / ( ( Date.now() - this.startTime ) / 1000 ) );

                this.track();
            }.bind(this));
        }
    }

});

module.exports = CamTracker;