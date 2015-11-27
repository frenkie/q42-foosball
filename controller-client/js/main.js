/**
 * Created by markd on 27/11/15.
 */
var MAIN = (function () {


    // socket
    var socket = io("http://10.42.38.110:9090");


    // initialize
    function init(){
        console.log(socket);
        $('#btn-reset-game').on('click', resetGame);
    }

    //socket connection test
    socket.on('ball-positions', function (positions) {
        console.log( positions.shift() );
    });

    function resetGame(){
        socket.emit('reset');
    }

    init ();

    // public API
    return {

    }

}());