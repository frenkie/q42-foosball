var FoosGame = function() {

    this.world = new FoosWorld();
    this.view = new FoosView();
    this.input = new DesktopControls();

    this.socket = io( $('#script-socket').attr('src').split('/socket.io')[0] );

    this.bindSocketEvents();
    this.update();

    window.addEventListener("touchend", function () {
        console.log("touchend");
        if (screenfull.enabled) {
            screenfull.request();
        }
    });
};

FoosGame.prototype = {

    bindSocketEvents: function () {
        this.socket.on('ball-positions', this.handleBallPositions.bind( this ));
    },

    handleBallPositions: function ( positions ) {
        var last = positions.shift();
        this.world.ball.position.setX( last.x );
        this.world.ball.position.setZ( last.y );
    },

    update: function () {
        requestAnimationFrame( this.update.bind(this));

        this.view.rotateCamera(this.input.getMouse());

        this.view.render(this.world.scene);
    }
};