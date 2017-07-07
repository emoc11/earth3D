/*
 * Gestion du CANVAS 3D pour la sphere
*/

var CONTROLS, camera, scene, renderer;

$(function() {

	// Animation variables
	var SPHERE_ROTATE = true;

	// Other variables
	var clicableObjects = [];
	var MOUSE_IS_DOWN = false;
	var MOUSECLIC_X;
	var MOUSECLIC_Y;

	// Set the scene size.
	var WIDTH = $(window).innerWidth();
	var HEIGHT = $(window).innerHeight();

	// Set some camera attributes.
	var VIEW_ANGLE = 45;
	var ASPECT = WIDTH / HEIGHT;
	var NEAR = 0.1;
	var FAR = 10000;

	// Get the DOM element to attach to
	var container =
	    document.querySelector('#sphere');

	// Create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer({alpha: true});
	renderer.setClearColor (0xFFFFFF, 1);

	// Start the renderer.
	renderer.setSize(WIDTH, HEIGHT);

	// Attach the renderer-supplied
	// DOM element.
	container.appendChild(renderer.domElement);

	scene = new THREE.Scene();

	// Set up the sphere vars
	// var faceNumberForDatas = Math.ceil(Math.sqrt(datas.length));
	var RADIUS = 60;
	var SEGMENTS = 32;
	var RINGS = 32;
	var DETAILS = 2;

	// Create a new mesh with
	// sphere geometry
	var textureLoader = new THREE.TextureLoader();
	var mainGeom = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
	var mainMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe:false });

	sphere = new THREE.Mesh(mainGeom, mainMaterial);

	// Move the Sphere back in Z so we
	// can see it.
	sphere.position.z = -190;
	sphere.rotation.x = 0;
	sphere.rotation.y = 0;

	// Finally, add the sphere to the scene.
	scene.add(sphere);

	camera =
	    new THREE.PerspectiveCamera(
	        VIEW_ANGLE,
	        ASPECT,
	        NEAR,
	        FAR
	    );

	// Add the camera to the scene.
	scene.add(camera);

	// Orbit Controls for camera
	CONTROLS = new THREE.OrbitControls( camera, renderer.domElement );
	CONTROLS.target = sphere.position;
	CONTROLS.autoRotate = true;
	CONTROLS.autoRotateSpeed = -0.05;
	CONTROLS.enableDamping = true;
	CONTROLS.dampingFactor = 0.15;
	CONTROLS.rotateSpeed = 0.2;

	// Create Night Sky with stars
	// var skyGeo = new THREE.SphereGeometry(300, 60, 60);
	// var skyMat = new THREE.MeshBasicMaterial({
	// 		// map: textureLoader.load('img/skystars.png'),
	// 		side: THREE.BackSide,
	// 		// opacity: 0.4,
	// 		// transparent: true,
	// 		color: 0xFFFFFF
	// });
	// var skyMesh = new THREE.Mesh(skyGeo, skyMat);

	// skyMesh.position.z = -150;
	// // Add clouds to sphere
	// scene.add(skyMesh);

	// Add Light
	var light = new THREE.AmbientLight( 0xFFFFFF, .6 );
	scene.add( light );

	// Spotligh in front of sphere
	var spotLight = new THREE.SpotLight(0xffffff, 5, 185, 10, 4);
	scene.add(spotLight);

	// Add Point sphere vertice
	var all_points = [];
	for (var i = 0; i < sphere.geometry.vertices.length; i++) {
		// var randPoint = Math.round(Math.random());
		// if( randPoint == 1) {
			placePoint(sphere.geometry.vertices[i]);
		// }
	}
	// all_points[100].material.color = new THREE.Color(0xFF0000);

	// Link each vertice to others
	// linkPointToPoint();

	// DRAW !
	function render() {
		renderer.render(scene, camera);
	}

	function update () {
		requestAnimationFrame(update);

		// sphere.rotation.x -= 1/32 * randSpeedRotateY;
		// sphere.rotation.y -= 1/32 * 0.03;
		CONTROLS.update();
		spotLight.position.copy( camera.getWorldPosition() );

		// if (WAIT_BEFORE_ROTATE <= 0) {
		// 	sphere.rotation.z += 1/32 * 0.01;
		// 	WAIT_BEFORE_ROTATE = 0;
		// } else if(WAIT_BEFORE_ROTATE > 0) {
		// 	WAIT_BEFORE_ROTATE -= 1;
		// }

		render();
	}

	// Schedule the first frame.
	requestAnimationFrame(update);

	$(window).on("resize", function() {
		WIDTH = $(window).innerWidth();
		HEIGHT = $(window).innerHeight();
		renderer.setSize(WIDTH, HEIGHT);
		camera.aspect = WIDTH / HEIGHT;
		camera.updateProjectionMatrix();
	});

	function placePoint(position) {
		var randRadius = Math.random() * 0.2 + 0.5;
		var pointGeom = new THREE.SphereGeometry(randRadius, SEGMENTS, RINGS);
		// var randColor = Math.round(Math.random() * 2+1);
		// switch(randColor) {
		// 	case 1:
		// 		randColor = 0xff0000;
		// 		break;
		// 	case 2:
		// 		randColor = 0x00ff00;
		// 		break;
		// 	case 3:
		// 		randColor = 0x0000ff;
		// 		break;
		// }
		randColor = 0x0000FF;
		var pointMaterial = new THREE.MeshPhongMaterial({ color: randColor, depthWrite: true, shininess: 0, transparent: false });

		newPoint = new THREE.Mesh(pointGeom, pointMaterial);
		newPoint.position.set(position.x, position.y, position.z);
		sphere.add(newPoint);
		all_points.push(newPoint);
	}

	function linkPointToPoint(pos1, pos2) {
		var lineCounter = 1;
		var lineDistanceMax = 0;
		for (var i = 0; i < all_points.length; i++) {
			var startPoint = all_points[i].position;

			if(i%32 == 0 && i <= all_points.length) {
				if(lineCounter <= 16) {
					lineDistanceMax = (RADIUS/4) - ((16-lineCounter)*0.62);
				} else if (lineCounter > 16) {
					lineDistanceMax = (RADIUS/4) + ((16-lineCounter)*0.62);
				}
				console.log(lineDistanceMax);
				// lineDistanceMax = 5 - (16-lineCounter);
				lineCounter += 1;
			}

			for (var f = 0; f < all_points.length; f++) {
				var endPoint = all_points[f].position;

				if(startPoint.distanceTo( endPoint ) <= lineDistanceMax) {
					var lineMaterial = new THREE.LineBasicMaterial({color: 0x000000});
					var lineGeom = new THREE.Geometry();
					lineGeom.vertices.push(startPoint);
					lineGeom.vertices.push(endPoint);

					newLine = new THREE.Line(lineGeom, lineMaterial);
					sphere.add(newLine);
				}
			}
		}

	}

	function niceDegree(deg) {
		if(deg > 360) {
			deg = deg - (Math.trunc((deg/360)) * 360);
		} else if(deg < 0) {
			deg = 360 + (deg + ((Math.trunc(Math.abs(deg)/360)) * 360));
		}
		return deg;
	}

	function latLongToVec3 ( lat, lon ) {
		lat =  lat * Math.PI / 180.0;
		lon = -lon * Math.PI / 180.0;

		return new THREE.Vector3(
			Math.cos(lat) * Math.cos(lon),
			Math.sin(lat),
			Math.cos(lat) * Math.sin(lon));
	}

	sphereFaceUsed = [];

	function findSphereFaceNumber(objType) {
		var rand = Math.trunc(Math.random() * sphere.geometry.faces.length);

		if(!sphereFaceUsed.includes(rand)) {
			sphereFaceUsed.push(rand);
			return rand;
		} else {
			return findSphereFaceNumber(objType);
		}
	}

	// function placeMarker(obj) {
	// 	var pinColor = new THREE.Color(obj.color);

	// 	var markerGeom = new THREE.Geometry();
	// 	var RandFace = findSphereFaceNumber(obj.type);

	// 	// Add type to this face
	// 	sphere.geometry.faces[RandFace].type = obj.type;
	// 	var copiedVertexs = sphere.geometry.faces[RandFace].vertexNormals;

	// 	for (var i = 0; i < copiedVertexs.length; i++) {
	// 		var vertex = copiedVertexs[i].clone();
	// 		var vector = new THREE.Vector3(vertex.x, vertex.y, vertex.z).multiplyScalar(RADIUS);
	// 		markerGeom.vertices.push(vector);
	// 	}
	// 	markerGeom.faces.push( new THREE.Face3( 0, 1, 2 ) );
	// 	markerGeom.computeFaceNormals();
	// 	var marker = new THREE.Mesh(
	// 		markerGeom,
	// 		new THREE.MeshLambertMaterial({color: pinColor, wireframe: false,transparent: true, opacity: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1})
	// 	);
	// 	marker.type = obj.type;

	// 	// Register good position on sphere
	// 	var destPos = {};
	// 	destPos.x = marker.position.x;
	// 	destPos.y = marker.position.y;
	// 	destPos.z = marker.position.z;

	// 	// Change position for random
	// 	marker.position.x = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;
	// 	marker.position.y = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;
	// 	marker.position.z = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;

	// 	marker.baseLoc = {};
	// 	marker.baseLoc.x = marker.position.x;
	// 	marker.baseLoc.y = marker.position.y;
	// 	marker.baseLoc.z = marker.position.z;

	// 	marker.sphereLoc = {};
	// 	marker.sphereLoc.x = destPos.x;
	// 	marker.sphereLoc.y = destPos.y;
	// 	marker.sphereLoc.z = destPos.z;

	// 	sphere.add(marker);
	// 	var speedAnim = Math.random() * 2 + 1;
	// 	TweenMax.to(marker.position, speedAnim/2, {x: destPos.x, y:destPos.y, z:destPos.z, ease:Quad.easeOut, delay: speedAnim/8});
	// 	TweenMax.to(marker.material, speedAnim/2, {opacity: 1, ease:Quad.easeOut});
	// 	clicableObjects.push(marker);
	// }


	// $.each(datas, function(i) {
	// 	switch(datas[i].type) {
	// 		case "actu":
	// 			datas[i].color = "rgb(255,0,0)";
	// 			break;
	// 		case "social":
	// 			datas[i].color = "rgb(0,255,0)";
	// 			break;
	// 		case "ambassadeur":
	// 			datas[i].color = "rgb(0,0,255)";
	// 			break;
	// 	}

	// 	placeMarker(datas[i]);
	// });

	var raycaster,mouse;
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener( 'mouseup', onDocumentMouseDown, false );
	function onDocumentMouseDown(event) {
		event.preventDefault();

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		// DETECT CLIC ON OBJECT
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( clicableObjects );
		if ( intersects.length > 0 ) {

			// Si clic sur pin -> direction sur la pin
			var obj = intersects[ 0 ];
			console.log(obj);
		}
	}

});