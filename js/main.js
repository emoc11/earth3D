/*
 * Gestion du CANVAS 3D pour la sphere
*/

var CONTROLS, camera, scene, renderer;

$(function() {

	// Animation variables
	var interactivObjects = [];
	var littlePointMoving = [];
	var pointNeedToMove = [];
	var circlOnPoint = [];
	var distCircPoints = [];
	var lastPointHover;
	var maxDistanceMove = 10;
	var hoverCirc;
	var wasNotOnHoverState = true;

	var maxScaleSphere = 1.03;
	var minScaleSphere = 1;
	var sphereNeedToBeLittle = false;
	var sphereScaleChanging = .0001;
	var SPHERE_SCALE_CHANGE = false;
	var SPHERE_SCALE = 1;
	var SPHERE_AUTO_ROTATE = true;

	// Other variables
	var MOUSE_IS_DOWN = false;

	// Set the scene size.
	var WIDTH = $(window).innerWidth();
	var HEIGHT = $(window).innerHeight();

	// Set some camera attributes.
	var VIEW_ANGLE = 45;
	var ASPECT = WIDTH / HEIGHT;
	var NEAR = 0.1;
	var FAR = 10000;

	// Get the DOM element to attach to
	var container = $('#sphere');

	// Create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer({alpha: true, antialiasing: true});
	renderer.setClearColor (0xFFFFFF, 0);

	// Start the renderer.
	renderer.setSize(WIDTH, HEIGHT);

	// Attach the renderer-supplied
	// DOM element.
	container.append(renderer.domElement);

	scene = new THREE.Scene();

	// Set up the sphere vars
	var RADIUS = 40;
	var SEGMENTS = 50;
	var RINGS = 50;

	// Create a new mesh with
	// sphere geometry
	var textureLoader = new THREE.TextureLoader();
	var mainGeom = new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS);
	var mainMaterial = new THREE.MeshPhongMaterial({ color: 0x1a15cb, wireframe:false, transparent: false, opacity:0.0, shininess:0 });

	sphere = new THREE.Mesh(mainGeom, mainMaterial);

	// Sphere position
	sphere.position.z = -170;
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
	CONTROLS.autoRotate = SPHERE_AUTO_ROTATE;
	CONTROLS.autoRotateSpeed = -0.05;
	CONTROLS.enableDamping = true;
	CONTROLS.dampingFactor = 0.15;
	CONTROLS.rotateSpeed = 0.2;
	CONTROLS.enableZoom = false;
	CONTROLS.enablePan = false;
	CONTROLS.enableKeys = false;
	CONTROLS.minPolarAngle = 70 * Math.PI / 180;
	CONTROLS.maxPolarAngle = Math.PI - (70 * Math.PI / 180);

	// Add Point sphere vertice
	// var all_points = [];
	var depl = {};
	var deplPoint = false;
	var wasOnFirst = true;
	var ringsCount = 0;

	for (var i = 0; i < sphere.geometry.vertices.length; i++) {
		if(i%RINGS == 0) {
			deplPoint = !deplPoint;

			if(!deplPoint && i>=1) {
				depl.x = sphere.geometry.vertices[i].x + ((sphere.geometry.vertices[i-1].x - sphere.geometry.vertices[i].x)/2);
				depl.y = sphere.geometry.vertices[i].y + ((sphere.geometry.vertices[i-1].y - sphere.geometry.vertices[i].y)/2);
				depl.z = sphere.geometry.vertices[i].z + ((sphere.geometry.vertices[i-1].z - sphere.geometry.vertices[i].z)/2);
				placePoint(depl);
			} else {
				placePoint(sphere.geometry.vertices[i]);
			}
			wasOnFirst = true;
			ringsCount++;
		} else {
			if(wasOnFirst && !deplPoint && ringsCount >= 6 && ringsCount <= RINGS-6) {
				depl.x = sphere.geometry.vertices[i].x;
				depl.y = sphere.geometry.vertices[i].y;
				depl.z = sphere.geometry.vertices[i].z;
				placePoint(depl);
			} else if (i >= 1 && deplPoint) {
				depl.x = sphere.geometry.vertices[i].x + ((sphere.geometry.vertices[i-1].x - sphere.geometry.vertices[i].x)/2);
				depl.y = sphere.geometry.vertices[i].y + ((sphere.geometry.vertices[i-1].y - sphere.geometry.vertices[i].y)/2);
				depl.z = sphere.geometry.vertices[i].z + ((sphere.geometry.vertices[i-1].z - sphere.geometry.vertices[i].z)/2);
				placePoint(depl);
			} else {
				placePoint(sphere.geometry.vertices[i]);
			}

			wasOnFirst = false;
		}
	}

	// DRAW !
	function render() {
		renderer.render(scene, camera);
	}

	function update () {
		requestAnimationFrame(update);

		CONTROLS.update();
		// spotLight.position.copy( camera.getWorldPosition() );

		if(SPHERE_SCALE_CHANGE) {
			if(sphereNeedToBeLittle) {
				SPHERE_SCALE -= sphereScaleChanging;
				if(SPHERE_SCALE <= minScaleSphere) {
					SPHERE_SCALE = minScaleSphere;
					sphereNeedToBeLittle = false;
				}
			} else {
				SPHERE_SCALE += sphereScaleChanging;
				if(SPHERE_SCALE >= maxScaleSphere) {
					SPHERE_SCALE = maxScaleSphere;
					sphereNeedToBeLittle = true;
				}
			}
			sphere.scale.set(SPHERE_SCALE, SPHERE_SCALE, SPHERE_SCALE);
		}

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

	function placePoint(position, otherColor) {
		// var randRadius = Math.random() * 0.2 + 0.5;
		var pointGeom = new THREE.SphereGeometry(0.2, 8, 8);
		var color = 0xFFFFFF;
		if(otherColor) color = 0xFF0000;
		var pointMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: false });

		newPoint = new THREE.Mesh(pointGeom, pointMaterial);
		var newVec = new THREE.Vector3(position.x, position.y, position.z);
		newVec.multiplyScalar(1.02);
		newPoint.position.copy(newVec);
		newPoint.categ = "";
		newPoint.defaultPos = new THREE.Vector3(newVec.x, newVec.y, newVec.z);
		sphere.add(newPoint);

		// all_points.push(newPoint);
		littlePointMoving.push(newPoint);
	}

	sphereChildrenUsed = [];
	function findSphereChildrenNumber() {
		var ringToIgnore = Math.round(RINGS/8);
		var rand = Math.trunc(Math.random() * (sphere.children.length - (SEGMENTS*ringToIgnore*2)) + SEGMENTS*ringToIgnore);

		if(!sphereChildrenUsed.includes(rand)) {
			sphereChildrenUsed.push(rand);
			return rand;
		} else {
			return findSphereChildrenNumber();
		}
	}


	$.each(datas, function(i) {
		switch(datas[i].type) {
			case "actu":
				datas[i].color = new THREE.Color(0xf25656);
				break;
			case "social":
				datas[i].color = new THREE.Color(0x00f6ff);
				break;
			case "ambassadeur":
				datas[i].color = new THREE.Color(0xffe400);
				break;
		}

		placeDataPoint(datas[i]);
	});

	function placeDataPoint(obj) {
		var pinColor = new THREE.Color(obj.color);
		var RandChildNumber = findSphereChildrenNumber();

		// Change this children : bigger + new color
		var newScale = 3;
		TweenMax.to(sphere.children[RandChildNumber].scale, .6, {x:newScale, y:newScale, z:newScale, ease: Back.easeOut, delay:Math.random() * 0.5});
		sphere.children[RandChildNumber].material.color = pinColor;
		sphere.children[RandChildNumber].categ = obj.type;

		// add this one to interactive and delete it from littlePointMoving
		interactivObjects.push(sphere.children[RandChildNumber]);
		littlePointMoving.splice(littlePointMoving.indexOf(sphere.children[RandChildNumber]), 1);
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

	var raycaster,mouse;
	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	function onDocumentMouseDown(event) {
		MOUSE_IS_DOWN = true;
	}

	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	function onDocumentMouseUp(event) {
		MOUSE_IS_DOWN = false;
	}

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove(event) {
		event.preventDefault();

		if(!MOUSE_IS_DOWN) {
			mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
			mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

			// DETECT CLIC ON OBJECT
			raycaster.setFromCamera( mouse, camera );
			var intersects = raycaster.intersectObjects( interactivObjects );
			if ( intersects.length > 0 ) {

				// Movement des points autour du point d'intérêt
				var obj = intersects[0];
				CONTROLS.autoRotate = false;
				if(wasNotOnHoverState) {
					pointNeedToMove = [];
				}
				wasNotOnHoverState = false;
				movePointsAround(intersects[0].object);
			} else {
				resetPointsPos();
				wasNotOnHoverState = true;
			}
		}
	}


	circlHoverPointUsed = [];
	function findCircPoint(activeCirc) {
		var rand = Math.trunc(Math.random() * activeCirc.geometry.vertices.length);

		if(!circlHoverPointUsed.includes(rand)) {
			circlHoverPointUsed.push(rand);
			return rand;
		} else {
			return findCircPoint();
		}
	}

	function movePointsAround(obj) {

		if(lastPointHover != obj.position) {
			resetPointsPos();

			for (var i = 0; i < littlePointMoving.length; i++) {
				var el = littlePointMoving[i];
				// var comparPos = new THREE.Vector3(elPos.x, elPos.y, elPos.z);
				var distance = obj.position.distanceTo(el.position);
				if(distance <= maxDistanceMove && distance > 0) {
					pointNeedToMove.push(el);
				}
			}

			var circGeom = new THREE.CircleGeometry( maxDistanceMove, 32 );
			var circMat = new THREE.MeshBasicMaterial( { color: 0x000000, transparent:true, opacity:0, wireframe: true } );
			hoverCirc = new THREE.Mesh( circGeom, circMat );
			scene.add(hoverCirc);

			obj.updateMatrixWorld();
			var vec = new THREE.Vector3();
			vec.setFromMatrixPosition(obj.matrixWorld);
			hoverCirc.position.set(vec.x, vec.y, vec.z);
			hoverCirc.lookAt(sphere.position);

			circlOnPoint.push(hoverCirc);

			for (var i = 0; i < pointNeedToMove.length; i++) {
				var tempDist = [];
				var destPos = {};
				var smallDist = 999999;

				hoverCirc.updateMatrixWorld();
				pointNeedToMove[i].updateMatrixWorld();

				for (var j = 1; j < hoverCirc.geometry.vertices.length-1; j++) {
					var testVecPoint = new THREE.Vector3();
					testVecPoint.setFromMatrixPosition(pointNeedToMove[i].matrixWorld);

					var testworldVecCirc = hoverCirc.geometry.vertices[j].clone();
					testworldVecCirc.applyMatrix4( hoverCirc.matrixWorld );

					var difDist = testVecPoint.distanceTo(testworldVecCirc);
					tempDist.push({
						"dist": difDist,
						"pos": testworldVecCirc
					});
				}

				tempDist.sort(function(a, b) {
				    return a.dist - b.dist;
				});
				destPos = tempDist[0].pos;
				destPos.z -= sphere.position.z;
				destPos.x += Math.random() - 0.5;
				destPos.y += Math.random() - 0.5;

				pointNeedToMove[i].position = testVecPoint.clone();

				TweenMax.to(pointNeedToMove[i].position, .5, {x: destPos.x, y: destPos.y, z: destPos.z, ease: Back.easeOut, delay: Math.random() * 0.1});
			}

			lastPointHover = obj.position;
		}
	}

	function resetPointsPos() {
		for (var i = 0; i < circlOnPoint.length; i++) {
			circlOnPoint[i].material.dispose();
			circlOnPoint[i].geometry.dispose();
			scene.remove(circlOnPoint[i]);
		}
		for (var i = 0; i < pointNeedToMove.length; i++) {
			var point = pointNeedToMove[i];

			TweenMax.to(point.position, .5, {x: point.defaultPos.x, y: point.defaultPos.y, z: point.defaultPos.z, ease: Back.easeOut });

			// pointNeedToMove.splice(i, 1);
		}
		lastPointHover = "";
		CONTROLS.autoRotate = true;
	}

});