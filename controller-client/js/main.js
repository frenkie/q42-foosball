/**
 * Created by markd on 27/11/15.
 */
var MAIN = (function () {


    // global variables
    var
        socket = null;
        $ddThemes = null;

    // initialize
    function init(){
        console.log(socket);

        //dirty way of getting
        socket = io($('#script-socket').attr('src').split('/socket.io')[0]);
        //io("http://10.42.38.110:9090");
        $('#btn-reset-game').on('click', resetGame);
        $('#btn-score-left').on('click', scoreLeft);
        $('#btn-score-right').on('click', scoreRight);
        $('#btn-subtract-score-left').on('click', subtractScoreLeft);
        $('#btn-subtract-score-right').on('click', subtractScoreRight);

        $ddThemes = $('#dd-change-theme');
        socket.emit('get-themes');
        socket.emit('get-current-theme');
        $ddThemes.on('change', changeTheme);
    }

    init ();

    //socket connection test
    socket.on('ball-positions', function (positions) {
        console.log( positions.shift() );
    });

    socket.on('get-themes', function (themes) {
        console.log( 'themes', themes);
        //$ddThemes.val(theme);
    });

    socket.on('get-current-theme', function (theme) {
        console.log( 'theme:' + theme);
        $ddThemes.val(theme);
    });

    function scoreLeft(){
        socket.emit('score-left');
    }

    function scoreRight(){
        socket.emit('score-right');
    }

    function subtractScoreLeft(){
        socket.emit('subtract-score-left');
    }

    function subtractScoreRight(){
        socket.emit('subtract-score-right');
    }

    function resetGame(){
        socket.emit('reset-game');
    }


    function changeTheme(){
        socket.emit('change-theme', this.value);
    }



    // public API
    return {

    }

}());