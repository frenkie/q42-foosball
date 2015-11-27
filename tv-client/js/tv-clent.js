var backgroundLayer = project.activeLayer;
var hitLayer = new Layer();
var trailBallLayer = new Layer();
var ballLayer = new Layer();
var overlayLayer = new Layer();
var scoreLayer = new Layer();

var ball;
var background;
var game;

var size = view.size;

var mousePos;

var hits = [];

var Hit = function ( posX, posY ) {

    hitLayer.activate();

    this.radius = 200;
    this.lifespan = 60;

    this.item = new Shape.Ellipse( {
        center : [posX, posY],
        size : [this.radius, this.radius],
        fillColor : 'rgba(0,0,0,0)',
        strokeColor : 'red',
        strokeWidth : 10
    } );

};

Hit.prototype.iterate = function () {

    this.item.size = this.lifespan * 4;

    if ( this.lifespan == 0 ) {
        var i = hits.indexOf( this );
        hits.splice( i, 1 );
    }

    this.lifespan --;
};


var trailBalls = [];
var TrailBall = function ( posX, posY, size ) {

    trailBallLayer.activate();

    this.radius = size * 5;
    this.lifespan = 120;

    this.item = new Path.Circle( {
        center : [posX, posY],
        radius : this.radius
    } );

    this.item.fillColor = {
        stops : ['rgba(255,255,0,0.5)', 'rgba(255,255,0,0.5)', 'rgba(255,0,0,0.5)', 'rgba(255,0,0,0)'],
        radial : true,
        origin : [posX, posY],
        destination : this.item.bounds.rightCenter,

    }

};

TrailBall.prototype.iterate = function () {

    this.item.scale( this.lifespan / 120 );

    this.item.opacity = this.lifespan / 240;

    if ( this.lifespan == 0 ) {
        var i = trailBalls.indexOf( this );
        trailBalls.splice( i, 1 );
    }

    this.lifespan --;
};


var Ball = function () {

    ballLayer.activate();

    this.radius = 50;

    this.item = new Shape.Ellipse( {
        center : [0, 0],
        size : [this.radius, this.radius],
        fillColor : 'rgba(0,0,255,1)'
    } );

    this.destination = Point.random() * (view.size + 100);
    this.stillCounter = 0;


};

Ball.prototype.iterate = function (  ) {


    if ( 0 > (this.item.position.x - this.radius / 2) ) {
        if ( this.allowNewHit ) {
            hits.push( new Hit( this.item.position.x - this.radius, this.item.position.y ) );
            this.allowNewHit = false;
        }
    } else if ( (this.item.position.x + this.radius / 2) > size.width ) {
        if ( this.allowNewHit ) {
            hits.push( new Hit( this.item.position.x + this.radius, this.item.position.y ) );
            this.allowNewHit = false;
        }
    } else if ( 0 > (this.item.position.y - this.radius / 2) ) {
        if ( this.allowNewHit ) {
            hits.push( new Hit( this.item.position.x, this.item.position.y - this.radius ) );
            this.allowNewHit = false;
        }
    } else if ( (this.item.position.y + this.radius / 2) > size.height ) {
        if ( this.allowNewHit ) {
            hits.push( new Hit( this.item.position.x, this.item.position.y + this.radius ) );
            this.allowNewHit = false;
        }
    } else {
        this.allowNewHit = true;
    }

    var speed = this.item.pre - this.item.position;

    if ( speed.length > 2 ) {

        if ( this.still ) {
            this.still.remove();
            this.still2.remove();
            this.still = undefined;
            this.stillCounter = 0;
        }

        var newPosX = Math.floor( Math.random() * ((this.item.pre.x - this.item.position.x) + 1) + this.item.position.x );
        var newPosY = Math.floor( Math.random() * ((this.item.pre.y - this.item.position.y) + 1) + this.item.position.y );

        trailBalls.push( new TrailBall(
            newPosX + Math.floor( Math.random() * 20 ),
            newPosY + Math.floor( Math.random() * 20 ), speed.length ) );

    } else if ( speed.length == 0 ) {

        if ( this.still ) {

            this.stillCounter = this.stillCounter + 1;

            if ( this.still.size.width >= 160 ) {
                this.still.size = 5;
            }
            this.still.size = this.still.size + 1;


            if ( this.still2 && this.still2.size.width >= 160 ) {
                this.still2.size = 5;
            }
            if ( this.still2 ) {
                this.still2.size = this.still2.size + 1;
            }
            if ( this.stillCounter == 60 ) {

                this.still2 = new Shape.Ellipse( {
                    center : [this.item.position.x, this.item.position.y],
                    size : [50, 50],
                    fillColor : 'rgba(0,0,0,0)',
                    strokeColor : 'blue',
                    strokeWidth : 5
                } );
            }

        } else {
            this.stillCounter = 0;
            this.still = new Shape.Ellipse( {
                center : [this.item.position.x, this.item.position.y],
                size : [50, 50],
                fillColor : 'rgba(0,0,0,0)',
                strokeColor : 'blue',
                strokeWidth : 5
            } );
        }


    }


    this.item.pre = this.item.position;


    //The vector is the difference between the position of
    //the text item and the destination point:

    var vector = this.destination - this.item.position;
    this.item.position += vector / 50;
    if ( vector.length < 5 ) {
        this.destination = Point.random() * view.size;
    }


    //this.item.position = mousePos;


};


var Background = function () {

    this.backgroundPrefix = '#background-';

    $( this.backgroundPrefix + 1 ).addClass( 'show' );


    //this.fieldLine =

};

Background.prototype.change = function ( index ) {

    $( '.show' ).removeClass( 'show' );

    if ( index == 0 ) {
        $( this.backgroundPrefix + index ).addClass( 'show' );
    } else if ( index == 1 ) {
        $( this.backgroundPrefix + index ).addClass( 'show' );

    }
};


function GameGraphics () {
    this.goals = [];
    this.score = [0, 0];

    scoreLayer.activate();

    this.scoreText = new PointText( {
        point : view.center,
        justification : 'center',
        fontSize : 100,
        fillColor : 'black'
    } );

    this.scoreText.content = this.score[0] + " : " + this.score[1];

};

GameGraphics.prototype = {

    goal : function ( team ) {

        this.lifespan = 60;

        overlayLayer.activate();

        if ( team == 0 ) {
            this.item = new Shape.Ellipse( {
                center : [0, size.height / 2],
                size : [200, 200],
                fillColor : 'red'
            } );
        } else if ( team == 1 ) {
            this.item = new Shape.Ellipse( {
                center : [size.width, size.height / 2],
                size : [200, 200],
                fillColor : 'red'
            } );
        }

        function iterate () {

            if ( this.lifespan == 0 ) {
                var i = trailBalls.indexOf( this );
                trailBalls.splice( i, 1 );
            }
            this.lifespan --;
        }
    },

    goalScored : function ( team ) {

        this.score[team] = this.score[team] + 1;

        this.goals.push( new this.goal( team ) );

        this.updateScore();
    },

    updateScore : function () {
        scoreLayer.activate();

        this.scoreText.content = this.score[0] + " : " + this.score[1];
    }

};




// Dummy events
function onKeyUp ( event ) {
    if ( event.key == '1' ) {
        game.goalScored( 0 );
    }
    if ( event.key == '2' ) {
        game.goalScored( 1 );
    }
    if ( event.key == '3' ) {
        background.change( 0 );
    }
    if ( event.key == '4' ) {
        background.change( 1 );
    }
}


function onFrame ( event ) {


    for ( var i = 0; i < hits.length; i ++ ) {
        hits[i].iterate();
    }

    for ( var y = 0; y < trailBalls.length; y ++ ) {
        trailBalls[y].iterate();
    }

    if (ball){
        ball.iterate( );
    }

}


function onMouseMove ( event ) {
    mousePos = event.point;
}


// UTILS
//function lineDistance ( point1x, point1y, point2x, point2y ) {
//    var xs = 0;
//    var ys = 0;
//
//    xs = point2x - point1x;
//    xs = xs * xs;
//
//    ys = point2y - point1y;
//    ys = ys * ys;
//
//    return Math.floor( Math.sqrt( xs + ys ) );
//}


jQuery( document ).ready( function () {
    background = new Background();
    ball = new Ball();
    //game = new GameGraphics();
});