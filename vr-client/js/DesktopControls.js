var DesktopControls = function() {
    this.movementKeys = [{keyCode: 37, isDown: false, movement: new THREE.Vector3(1, 0, 0)}, //leftkey
                    {keyCode: 38, isDown: false, movement : new THREE.Vector3(0,0,1)}, //upkey
                    {keyCode: 39, isDown: false, movement : new THREE.Vector3(-1,0,0)}, //rightkey
                    {keyCode: 40, isDown: false, movement : new THREE.Vector3(0,0,-1)}, //downkey
                    {keyCode: 33, isDown: false, movement : new THREE.Vector3(0,-1,0)}, //pageup
                    {keyCode: 34, isDown: false, movement : new THREE.Vector3(0,1,0)} //pagedown
                ];

    this.mouseChanged = {x: 0, y: 0};

    this.eventKeyHandler = this.updateKey.bind(this);
    this.eventMouseHandler = this.updateMouse.bind(this);

    this.init();


};

DesktopControls.prototype.init = function(){
    window.addEventListener('keydown', this.eventKeyHandler );
    window.addEventListener('keyup', this.eventKeyHandler );
    window.addEventListener('mousemove', this.eventMouseHandler );
};

DesktopControls.prototype.updateKey = function(input){
    this.movementKeys.forEach(function (key) {
        if (key.keyCode == input.keyCode){
            key.isDown = input.type === "keydown";
        }
    });
};

DesktopControls.prototype.updateMouse = function(input){
    this.mouseChanged.x += input.movementX;
    this.mouseChanged.y += input.movementY;
};

DesktopControls.prototype.getMovement = function(){
    var r = new THREE.Vector3();

    this.movementKeys.forEach(function (key) {
        if (key.isDown){
            r.add(key.movement);
        }
    });
    return r;
};

DesktopControls.prototype.getMouse = function(){
    var r = {x: this.mouseChanged.x, y: this.mouseChanged.y};
    this.mouseChanged.x = this.mouseChanged.y = 0;
    return r;
};
