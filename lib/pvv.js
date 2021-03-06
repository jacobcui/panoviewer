$(function(){
    var KEY_LEFT = 37;
    var KEY_UP = 38;
    var KEY_RIGHT = 39;
    var KEY_DOWN = 40;
    var ZOOM_DELTA = 120;

    var camera, scene, renderer, focus;
    var canvasid = 'pv_canvas__';
    var floorid = 'pv_floor__';
    var floor_imageid = 'pv_floor_image';

    var pan_lt = 'pan_lt';
    var pan_rt = 'pan_rt';
    var pan_up = 'pan_up';
    var pan_down = 'pan_down';
    var pan_timer;

    var zoom_in = 'zoom_in';
    var zoom_out = 'zoom_out';

    var lon = 0, lat = 0;
    var phi = 0, theta = 0;
    var pointLight, light;

    var canvasWidth = window.innerWidth;
    var canvasHeight = window.innerHeight;

    function getjid(domId){
	return '#' + domId;
    }

    function getDom(domId){
	return document.getElementById(domId);
    }

    function getDomParent(domId){
	return getDom(domId).parentNode;
    }

    function getParentHeight(domId){
	return getDomParent(domId).offsetHeight;
    }

    function getParentWidth(domId){
	return getDomParent(domId).offsetWidth;
    }

    function getCanvasWidth(canvasId){
	return getParentWidth(canvasId);
    }

    function getCanvasHeight(canvasId){
	return getParentHeight(canvasId);
    }

    init();
    render();

    function init(){
	// set the scene size
	getDomParent(canvasid).style.height = canvasHeight + "px";

	var side_len = getCanvasWidth(canvasid);
	var center_distance = side_len / 2.0;

	// set some camera attributes
	VIEW_ANGLE = 70;  NEAR = 0.1;    FAR = 1000;

	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, getCanvasWidth(canvasid) / getCanvasHeight(canvasid), NEAR, FAR);
	scene = new THREE.Scene();
	scene.add(camera);     // add the camera to the scene

//	renderer = new THREE.CSS3DRenderer();
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize(getCanvasWidth(canvasid), getCanvasHeight(canvasid));
	
	focus = new THREE.Vector3( 0, 0, -center_distance );

	var video = document.createElement( 'video' );
	video.width = side_len;
	video.src = "/static/media/snow.mp4";
	video.controls = true;
	video.autoplay = true;
	video.loop = true;
	video.playbackRate = 1;
	
	texture = new THREE.VideoTexture( video );
	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;

	texture.minFilter = THREE.LinearFilter;
	texture.magFilter = THREE.LinearFilter;
	texture.format = THREE.RGBFormat;		
	// mesh
	var sphere = new THREE.Mesh(
	    new THREE.SphereGeometry(100, 32,32),
	    new THREE.MeshBasicMaterial({
		//map: THREE.ImageUtils.loadTexture('/static/images/setb/tms.jpg')
		map: new THREE.VideoTexture(video)
	    })
	);
	sphere.scale.x = -1;
	scene.add(sphere);

	pointLight = new THREE.PointLight(0x000000);
	scene.add(pointLight);
	
	document.getElementById(canvasid).appendChild(renderer.domElement);
	document.getElementById(canvasid).addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.getElementById(pan_lt).addEventListener( 'mousedown', function(e){pan_timer = setInterval(onSceneMoveLeft, 50)}, false );
	document.getElementById(pan_lt).addEventListener( 'mouseup', function(e){window.clearInterval(pan_timer)}, false );
	document.getElementById(pan_rt).addEventListener( 'mousedown', function(e){pan_timer = setInterval(onSceneMoveRight,50)}, false );
	document.getElementById(pan_rt).addEventListener( 'mouseup', function(e){window.clearInterval(pan_timer)}, false );
	document.getElementById(pan_up).addEventListener( 'mousedown', function(e){pan_timer = setInterval(onSceneMoveUp, 50)}, false );
	document.getElementById(pan_up).addEventListener( 'mouseup', function(e){window.clearInterval(pan_timer)}, false );
	document.getElementById(pan_down).addEventListener( 'mousedown', function(e){pan_timer = setInterval(onSceneMoveDown, 50)}, false );
	document.getElementById(pan_down).addEventListener( 'mouseup', function(e){window.clearInterval(pan_timer)}, false );
	document.getElementById(zoom_in).addEventListener( 'mousedown', onSceneZoomIn, false );
	document.getElementById(zoom_out).addEventListener( 'mousedown', onSceneZoomOut, false );
	document.addEventListener( 'keydown', onDocumentKeyDown, false );
	document.addEventListener( 'keypress', onDocumentKeyPress, false );
	document.addEventListener( 'keyup', onDocumentKeyUp, false );
	//    document.getElementById(canvasid).addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	document.getElementById(canvasid).addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.getElementById(canvasid).addEventListener( 'touchmove', onDocumentTouchMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
    }

    function onWindowResize() {
	camera.aspect = getCanvasWidth(canvasid) / getCanvasHeight(canvasid);
	camera.updateProjectionMatrix();
	renderer.setSize( getCanvasWidth(canvasid), getCanvasHeight(canvasid) );
    }

    function render() {
	requestAnimationFrame(render);
	lat = Math.max( -89, Math.min(89, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );
	
	focus.x = Math.sin( phi ) * Math.cos( theta );
	focus.y = Math.cos( phi );
	focus.z = Math.sin( phi ) * Math.sin( theta );

	camera.lookAt(focus);

	renderer.render(scene, camera);
    }

    function onDocumentMouseMove(event){
	var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
	lon -= movementX * 0.5;
	lat += movementY * 0.5;
	//http://threejs.org/examples/css3d_panorama.html
    };

    function onDocumentKeyDown(event){
	var angle = 5;
	switch(event.keyCode){
	case KEY_LEFT:
	    lon -= angle;
	    break;
	case KEY_UP:
	    lat += angle;
	    break;
	case KEY_RIGHT:
	    lon += angle;
	    break;
	case KEY_DOWN:
	    lat -= angle;
	    break;
	}
    };

    function onSceneMoveUp(event){
	onDocumentKeyDown({keyCode: KEY_UP});
    }

    function onSceneMoveLeft(event){
	onDocumentKeyDown({keyCode: KEY_LEFT});
    }
    function onSceneMoveRight(event){
	onDocumentKeyDown({keyCode: KEY_RIGHT});
    }
    function onSceneMoveDown(event){
	onDocumentKeyDown({keyCode: KEY_DOWN});
    }

    function onDocumentKeyPress(event){
	//console.log(event.keyCode + "press");
    };

    function onDocumentKeyUp(event){
	//console.log(event.keyCode + "up");
    };

    function onDocumentMouseDown( event ) {
	event.preventDefault();
	document.body.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.body.addEventListener( 'mouseup', onDocumentMouseUp, false );
    }

    function onDocumentMouseUp( event ) {
	document.body.removeEventListener( 'mousemove', onDocumentMouseMove );
	document.body.removeEventListener( 'mouseup', onDocumentMouseUp );
    }

    function onDocumentMouseWheel( event ) {
	camera.fov -= event.wheelDeltaY * 0.05;
	camera.updateProjectionMatrix();
    }


    function onSceneZoomIn(){
	onDocumentMouseWheel({wheelDeltaY: ZOOM_DELTA});
    }

    function onSceneZoomOut(){
	onDocumentMouseWheel({wheelDeltaY: -ZOOM_DELTA});
    }

    function onDocumentTouchStart( event ) {
	event.preventDefault();

	var touch = event.touches[ 0 ];

	touchX = touch.screenX;
	touchY = touch.screenY;
    }

    function onDocumentTouchMove( event ) {
	event.preventDefault();

	var touch = event.touches[ 0 ];

	lon -= ( touch.screenX - touchX ) * 0.1;
	lat += ( touch.screenY - touchY ) * 0.1;

	touchX = touch.screenX;
	touchY = touch.screenY;
    }

    function Radar(parentid, id, lat, lon)
    {
	this.lat = lat;
	this.lon = lon;
	this.id = id;
	this.parentid = parentid;

	this.put = function(containerid)
	{
	    this.divid =  this.parentid + "_" + this.id;
	    this.div = $("<div id=" + this.divid + ">"); //Equivalent: $(document.createElement('img'))
	    this.div.appendTo('#' + containerid);
	    this.div.css('position', 'absolute');
	    this.div.css('left', this.lat + 'px');
	    this.div.css('top', this.lon + 'px');

	    this.image = $("<img>"); //Equivalent: $(document.createElement('img'))
	    this.image.attr('src', '/get/scene/c');
	    this.image.appendTo('#' + this.divid);
	    this.image.attr('');
	    return this.image;
	};
    }

    var radars = new Array();
    var radar_count = 0;
    var radar_poss = 0;
});
