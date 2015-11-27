var FoosWorld = function() {

    this.worldObject = new THREE.Object3D();
    this.globalLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);

    this.scene = new THREE.Scene();

    var texture = THREE.ImageUtils.loadTexture(
        'assets/textures/checkerboard.png'
    );

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(50, 50);

    var material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 20,
        shading: THREE.FlatShading,
        map: texture
    });

    //var material = new THREE.MeshPhongMaterial({color: 0x33AA22});
    var geometry = new THREE.PlaneGeometry(1000, 1000);

    this.floor = new THREE.Mesh(geometry, material);

    var ballGeometry = new THREE.SphereGeometry( 2, 32, 32 );
    var ballMaterial = new THREE.MeshBasicMaterial( {color: 0xff0024} );
    this.ball = new THREE.Mesh( ballGeometry, ballMaterial );

    this.init();
};

FoosWorld.prototype = {

    init: function () {
        this.worldObject.position.set(2,2,2);
        this.scene.add( this.worldObject );

        this.globalLight.color.setHSL( 0.6, 1, 0.6 );
        this.globalLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.globalLight.position.set( 0, 500, 0 );
        this.scene.add(this.globalLight);

        this.floor.rotation.x = -Math.PI / 2;
        this.floor.position.set( 0, -1, 0 );
        this.scene.add(this.floor);

        this.ball.position.set(10, 2, 10);
        this.scene.add( this.ball );
    }
};