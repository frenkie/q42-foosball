//function fussballViz(){
//
//}

var backgroundLayer = project.activeLayer;
var fieldLayer = new Layer();
var hitLayer = new Layer();
var trailBallLayer = new Layer();
var ballLayer = new Layer();
var overlayLayer = new Layer();
var scoreLayer = new Layer();

var ball;
var background;
var game;
//var goals;

var teamColors = ["red", "blue"];
var ownerColor = "white";

var replayBalls = [];

var replaySeconds = 3;
var replayPositions = [];

var size = view.size;

var screenSize = {
    x : 68,
    y : 120
};

var mousePos;
var useMousePos = false;

var hits = [];

var socket = io( "http://10.42.38.110:9090" );
var currentPos;

createjs.Sound.registerSound( "sounds/explosion-long.wav", "explosion-long" );
createjs.Sound.registerSound( "sounds/explosion-short.wav", "explosion-short" );
createjs.Sound.registerSound( "sounds/goal1.wav", "goal" );


function handleSocketEvents () {

    //socket.on('reset-game', function ( positions ) {
    background = new Background();
    pitch = new Pitch();
    ball = new Ball();
    game = new GameGraphics();
    //});


    socket.on( 'ball-positions', function ( positions ) {
        if ( ! useMousePos ) {
            currentPos = positions.shift();
        }
    } );

    socket.on( 'score-left', function ( event ) {
        console.log( event );
        game.goalScored( 0 );
    } );

    socket.on( 'score-right', function ( event ) {
        console.log( event );
        game.goalScored( 1 );
    } );

}


var Hit = function ( posX, posY ) {

    hitLayer.activate();

    this.radius = 200;
    this.lifespan = 60;

    this.item = new Shape.Ellipse( {
        center : [posX, posY],
        size : [this.radius, this.radius],
        fillColor : 'rgba(0,0,0,0)',
        strokeColor : ownerColor,
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


function ReplayBall () {

    if ( ball.item ) {
        ball.item.remove();
    }
    ball.removeStills();

    ball = undefined;

    this.radius = 50;

    this.item = new Shape.Ellipse( {
        center : [0, 0],
        size : [this.radius, this.radius],
        fillColor : ownerColor
    } );


}

ReplayBall.prototype.iterate = function () {

    if ( replayPositions.length > 0 ) {
        var pos = replayPositions.shift();
        this.item.position.x = pos[0];
        this.item.position.y = pos[1];
    } else {
        this.item.remove();
        var i = replayBalls.indexOf( this );
        replayBalls.splice( i, 1 );
        ball = new Ball();
    }

};

var trailBalls = [];
var TrailBall = function ( posX, posY, size ) {

    var maxSize = 20;
    trailBallLayer.activate();

    if ( size > maxSize ) {
        size = maxSize;
    }

    this.radius = size * 5;
    this.lifespan = 120;

    this.item = new Path.Circle( {
        center : [posX, posY],
        radius : this.radius
    } );

    this.item.fillColor = {
        stops : ['rgba(0,255,200,0.5)', 'rgba(0,255,255,0.5)', 'rgba(0,0,255,0.5)', 'rgba(0,0,255,0)'],
        radial : true,
        origin : [posX, posY],
        destination : this.item.bounds.rightCenter
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

    this.replayPositions = [];
    this.maxReplayPositions = replaySeconds * 60;
};


Ball.prototype.removeStills = function () {
    if ( this.still ) {
        this.still.remove();
    }
    if ( this.still2 ) {
        this.still2.remove();
    }

    this.stillCounter = 0;
    this.still2 = undefined;
    this.still = undefined;
};

Ball.prototype.iterate = function ( position ) {

    console.log( position );
    if ( ! useMousePos ) {
        this.item.position.x = position.x / screenSize.x * size.width;
        this.item.position.y = position.y / screenSize.y * size.height;
    } else {
        this.item.position.x = position.x;
        this.item.position.y = position.y;
    }

    replayPositions.push( [this.item.position.x, this.item.position.y] );

    if ( replayPositions.length >= this.maxReplayPositions ) {
        replayPositions.shift();
    }

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

        this.removeStills();

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
                    strokeColor : ownerColor,
                    strokeWidth : 5
                } );
            }

        } else {
            this.stillCounter = 0;
            this.still = new Shape.Ellipse( {
                center : [this.item.position.x, this.item.position.y],
                size : [50, 50],
                fillColor : 'rgba(0,0,0,0)',
                strokeColor : ownerColor,
                strokeWidth : 5
            } );
        }


    }


    this.item.pre = this.item.position;


    //The vector is the difference between the position of
    //the text item and the destination point:

    //var vector = this.destination - this.item.position;
    //this.item.position += vector / 50;
    //if ( vector.length < 5 ) {
    //    this.destination = Point.random() * view.size;
    //}


    //this.item.position = mousePos;

};

var Pitch = function () {

    fieldLayer.activate();

    this.fieldLines = new Group();

    this.centerLine = new Path( {
        strokeColor : "white",
        strokeWidth : 5
    } );

    this.centerLine.add( new Point( size.width / 2, 0 ) );
    this.centerLine.add( new Point( size.width / 2, size.height ) );
    this.fieldLines.addChild( this.centerLine );

    this.centerCircle = new Shape.Ellipse( {
        center : [size.width / 2, size.height / 2],
        size : [size.width / 4, size.width / 4],
        strokeColor : 'white',
        strokeWidth : 5
    } );

    this.fieldLines.addChild( this.centerCircle );

    this.goalLeft = new Shape.Rectangle( {
        center : [0, size.height / 2],
        size : [size.height / 3, size.height / 3],
        strokeColor : 'white',
        strokeWidth : 5

    } );
    this.fieldLines.addChild( this.goalLeft );

    this.goalRight = new Shape.Rectangle( {
        center : [size.width, size.height / 2],
        size : [size.height / 3, size.height / 3],
        strokeColor : 'white',
        strokeWidth : 5
    } );

    this.fieldLines.addChild( this.goalRight );
};

Pitch.prototype.change = function ( color ) {

    this.fieldLines.strokeColor = color;

};

var Background = function () {

    this.backgroundPrefix = '#background-';

    backgroundLayer.activate();

    this.backdrop = new Shape.Rectangle( {
        center : [size.width / 2, size.height / 2],
        size : [size.width, size.height],
        fillColor : 'black'
    } );


    this.currentBackground = 1;


};

Background.prototype.change = function ( index ) {

    $( '.show' ).removeClass( 'show' );
    $( this.backgroundPrefix + index ).addClass( 'show' );

    if ( this.backdrop ) {
        this.backdrop.remove();
    }

};

function Goal ( team ) {

    pitch.change( teamColors[team] );

    this.lifespan = 0;

    overlayLayer.activate();

    this.scoreText = new PointText( {
        point : view.center,
        justification : 'center',
        fontSize : 20,
        fillColor : 'white'
    } );

    this.scoreText.content = "GOAL!!";
    this.scoreText.rotation = 0;

    createjs.Sound.play( 'goal' );

}

Goal.prototype.iterate = function () {

    this.scoreText.scale( this.lifespan.map( 0, 180, 1, 1.3 ) );
    this.scoreText.rotation = this.scoreText.rotation + 8;


    if ( this.lifespan == 180 ) {
        this.scoreText.remove();
        var i = game.goals.indexOf( this );
        game.goals.splice( i, 1 );
    }
    this.lifespan ++;
};


function GameGraphics () {
    this.score = [0, 0];
    this.goals = [];

    scoreLayer.activate();

    //this.scoreText = new PointText( {
    //    point : view.center,
    //    justification : 'center',
    //    fontSize : 100,
    //    fillColor : 'black'
    //} );
    //
    //this.scoreText.content = this.score[0] + " : " + this.score[1];

};

GameGraphics.prototype = {

    goalScored : function ( team ) {

        this.score[team] = this.score[team] + 1;

        this.goals.push( new Goal( team ) );

        replayBalls.push( new ReplayBall() );

        //background.change();
    },

    updateScore : function () {
        scoreLayer.activate();

        this.scoreText.content = this.score[0] + " : " + this.score[1];
    }

};


// Dummy events
function onKeyUp ( event ) {

    if ( event.key == '1' ) {
        background.change( 0 );
    }
    if ( event.key == '2' ) {
        background.change( 1 );
    }
    if ( event.key == '3' ) {
        background.change( 2 );
    }
    if ( event.key == '4' ) {
        background.change( 3 );
    }

    if ( event.key == '5' ) {
        game.goalScored( 0 );
    }
    if ( event.key == '6' ) {
        game.goalScored( 1 );
    }

    if ( event.key == '0' ) {
        useMousePos = ! useMousePos;
        //console.log( useMousePos );
    }
}


function onFrame ( event ) {

    if ( game ) {
        for ( var i = 0; i < hits.length; i ++ ) {
            hits[i].iterate();
        }

        for ( var y = 0; y < trailBalls.length; y ++ ) {
            trailBalls[y].iterate();
        }


        for ( var g = 0; g < game.goals.length; g ++ ) {
            game.goals[g].iterate();
        }

        if ( replayBalls.length ) {
            replayBalls[0].iterate();
        }

        if ( ball && currentPos ) {
            ball.iterate( currentPos );
        }

    }
}


function onMouseMove ( event ) {
    if ( useMousePos )
        currentPos = event.point;
}

Number.prototype.map = function ( in_min, in_max, out_min, out_max ) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};


handleSocketEvents();