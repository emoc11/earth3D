$(function() {

	// ETOILES AUTOUR
	// FLARE ATOUR DE LA PLANETE

	// Animation variables
	var SPHERE_ROTATE = true;
	// var WAIT_BEFORE_ROTATE = 0;
	// var WAIT_BEFORE_ROTATE_TIME = 200;

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

	var cameraRotation = 0;

	// Get the DOM element to attach to
	var container =
	    document.querySelector('#sphere');

	// Create a WebGL renderer, camera
	// and a scene
	var renderer = new THREE.WebGLRenderer();
	var camera =
	    new THREE.PerspectiveCamera(
	        VIEW_ANGLE,
	        ASPECT,
	        NEAR,
	        FAR
	    );

	var scene = new THREE.Scene();

	// Add the camera to the scene.
	scene.add(camera);

	// Start the renderer.
	renderer.setSize(WIDTH, HEIGHT);

	// Attach the renderer-supplied
	// DOM element.
	container.appendChild(renderer.domElement);

	// Set up the sphere vars
	var RADIUS = 50;
	var SEGMENTS = 8;
	var RINGS = 8;
	var DETAILS = 2;

	// Create a new mesh with
	// sphere geometry
	var textureLoader = new THREE.TextureLoader();
	var mainGeom = new THREE.IcosahedronGeometry(RADIUS, DETAILS);
	var mainMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false });

	sphere = new THREE.Mesh(mainGeom, mainMaterial);

	// Move the Sphere back in Z so we
	// can see it.
	sphere.position.z = -190;
	sphere.rotation.x = 90 * Math.PI / 180;
	sphere.rotation.y = 0;

	// Mouse orbit control

	// Finally, add the sphere to the scene.
	scene.add(sphere);

	// Create Night Sky with stars
	var skyGeo = new THREE.SphereGeometry(300, 60, 60);
	var skyMat = new THREE.MeshBasicMaterial({
			map: textureLoader.load('img/skystars.png'),
			side: THREE.BackSide,
			opacity: 0.4,
			transparent: true,
	});
	var skyMesh = new THREE.Mesh(skyGeo, skyMat);

	skyMesh.position.z = -400;
	// Add clouds to sphere
	scene.add(skyMesh);

	// Add Light
	var light = new THREE.AmbientLight( 0xFFFFFF, .3 );
	scene.add( light );


	var spotLight = new THREE.SpotLight(0xffffff, 5, 185, 10, 4);
	scene.add(spotLight);

	// DRAW !
	function render() {
		renderer.render(scene, camera);
	}

	function update () {
		requestAnimationFrame(update);

		sphere.rotation.z += 1/32 * 0.01;

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

	function getPosition() {
		// Random latitude from -90° to 90°
		var lat = Math.round(Math.random() * 180 - 90);
		// Random longitude from -180° to 180°
		var long = Math.round(Math.random() * 360 - 180);
		//return both values
		return lat+","+long;
	}

	function changeLocalisation(localisation) {
		var latLon = localisation.split(",");
		var lat = latLon[0];
		var lon = latLon[1];

		var verticalOffset = 0.1;

		var longToDest = 270 - lon;
		rotateOnGoodSide(longToDest);
		// WAIT_BEFORE_ROTATE = WAIT_BEFORE_ROTATE_TIME;
	}

	function rotateOnGoodSide( targetDegree ){
		var currentYRotation = sphere.rotation.y * 180 / Math.PI;

		// Nicely refacto degree to min 0° and max 360°
		currentYRotation = niceDegree(currentYRotation);
		targetDegree = niceDegree(targetDegree);

		var angleToGo = 0;

		if((targetDegree-currentYRotation) > 180) {
			angleToGo = (360 - (targetDegree-currentYRotation)) * (Math.PI / 180);
			TweenMax.to(sphere.rotation, .3, {y: "-="+angleToGo, ease: Quad.easeOut});
		} else {
			angleToGo = ((targetDegree-currentYRotation)) * (Math.PI / 180);
			TweenMax.to(sphere.rotation, .3, {y: "+="+angleToGo, ease: Quad.easeOut});
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

	function niceLatitude(lat) {
		if(lat > 90) {
			lat = -(Math.trunc((lat/90)) * 90) + Math.abs(90 - lat);
		} else if(lat < -90) {
			lat = (Math.trunc((lat/90)) * 90) - Math.abs(lat + 90);
		}
		return lat;
	}

	function niceLongitude(lon) {
		if(lon > 180) {
			lon = -(Math.trunc((lon/180)) * 180) + Math.abs(180 - lon);
		} else if(lon < -180) {
			lon = (Math.trunc((lon/180)) * 180) - Math.abs(lon + 180);
		}
		return lon;
	}

	function latLongToVec3 ( lat, lon ) {
		lat =  lat * Math.PI / 180.0;
		lon = -lon * Math.PI / 180.0;

		// RANDOM ON CIRCLE AND SOME OUTSIDE
		// var rd = Math.round(Math.random() * 15 - 5);
		// var displacement = - Math.random();
		// if(rd == -5) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon),
		// 		Math.sin(lat),
		// 		Math.cos(lat + displacement) * Math.sin(lon));
		// } else if(rd == -4) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon),
		// 		Math.sin(lat),
		// 		Math.cos(lat) * Math.sin(lon + displacement));
		// } else if(rd == -3) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon),
		// 		Math.sin(lat + displacement),
		// 		Math.cos(lat) * Math.sin(lon));
		// } else if(rd == -2) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon),
		// 		Math.sin(lat + displacement),
		// 		Math.cos(lat) * Math.sin(lon));
		// } else if(rd == -1) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat + displacement) * Math.cos(lon),
		// 		Math.sin(lat),
		// 		Math.cos(lat) * Math.sin(lon));
		// } else if(rd == 0) {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon + displacement),
		// 		Math.sin(lat),
		// 		Math.cos(lat) * Math.sin(lon));
		// } else {
		// 	return new THREE.Vector3(
		// 		Math.cos(lat) * Math.cos(lon),
		// 		Math.sin(lat),
		// 		Math.cos(lat) * Math.sin(lon));
		// }

		return new THREE.Vector3(
			Math.cos(lat) * Math.cos(lon),
			Math.sin(lat),
			Math.cos(lat) * Math.sin(lon));
	}

	function placeMarker(localisation, obj) {
		var latLon = localisation.split(",");
		var lat = parseFloat(latLon[0]);
		var lon = parseFloat(latLon[1]);

		var latLonPos = latLongToVec3(lat, lon);
		latLonPos.multiplyScalar(RADIUS);

		var pinColor = new THREE.Color(obj.color);

		var markerGeom = new THREE.Geometry();

		for (var i = 3 - 1; i >= 0; i--) {

			var vector;

			// BASE
			// if(i == 2) {
			// 	vector = new THREE.Vector3(0,0,0);
			// } else if (i == 1) {
			// 	vector = new THREE.Vector3(x,0,0);
			// } else {
			// 	vector = new THREE.Vector3(x,y,0);
			// }

			var newLat, newLon;
			var Rand = 320;
			console.log('BEFORE lat', lat);
			console.log('BEFORE lon', lon);
			if(i == 2) {
				newLat = niceLatitude(lat + Rand);
				newLon = niceLongitude(lon + Rand);
				console.log('AFTER lat', newLat);
				console.log('AFTER lon', newLon);
				vector = latLongToVec3(newLat, newLon);
			} else if (i == 1) {
				newLat = niceLatitude(lat + Rand);
				newLon = niceLongitude(lon - Rand);
				console.log('AFTER lat', newLat);
				console.log('AFTER lon', newLon);
				vector = latLongToVec3(newLat, newLon);
			} else {
				newLat = niceLatitude(lat - Rand);
				newLon = niceLongitude(lon + Rand);
				console.log('AFTER lat', newLat);
				console.log('AFTER lon', newLon);
				vector = latLongToVec3(newLat, newLon);
			}
			console.log("=========");

			markerGeom.vertices.push(vector);
		};

		markerGeom.faces.push( new THREE.Face3( 0, 1, 2 ) );
		markerGeom.computeFaceNormals();

		var marker = new THREE.Mesh(
			markerGeom,
			new THREE.MeshLambertMaterial({color: pinColor,transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide})
		);
		marker.scale.set( 3,3,3 );

		// var marker = new THREE.Mesh(
		// 	new THREE.PlaneGeometry(5,5,16),
		// 	new THREE.MeshLambertMaterial({color: pinColor, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide})
		// );
		marker.type = obj.type;

		// marker.position.copy(latLonPos);
		marker.position.x = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;
		marker.position.y = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;
		marker.position.z = Math.random() * $(window).innerHeight()/4 - $(window).innerHeight()/8;

		marker.baseLoc = {};
		marker.baseLoc.x = marker.position.x;
		marker.baseLoc.y = marker.position.y;
		marker.baseLoc.z = marker.position.z;

		marker.sphereLoc = {};
		marker.sphereLoc.x = latLonPos.x;
		marker.sphereLoc.y = latLonPos.y;
		marker.sphereLoc.z = latLonPos.z;

		sphere.add(marker);
		var speedAnim = Math.random() * 2 + .5;
		TweenMax.to(marker.position, speedAnim/2, {x: latLonPos.x, y:latLonPos.y, z:latLonPos.z, ease:Quad.easeOut, delay: speedAnim/8});
		TweenMax.to(marker.material, speedAnim/2, {opacity: 1, ease:Quad.easeOut});
		clicableObjects.push(marker);
	}


	$.each(datas, function(i) {
		var latlong = getPosition();
		switch(datas[i].type) {
			case "actu":
				datas[i].color = "rgb(255,0,0)";
				break;
			case "social":
				datas[i].color = "rgb(0,255,0)";
				break;
			case "ambassadeur":
				datas[i].color = "rgb(0,0,255)";
				break;
		}

		placeMarker(latlong, datas[i]);
	});

	$("nav li").bind("click", function() {
		var typeToShow = $(this).attr("data-type");

		filterMarker(typeToShow);
	});

	function doOutAnim() {
		// EXPLOSION ANIM, comme pour apparaitre en sens inverse
		// $.each(sphere.children, function() {
		// 	var speedAnim = Math.random() * 2 + .5;
		// 	TweenMax.to(this.position, speedAnim, {x: this.baseLoc.x, y: this.baseLoc.y, z: this.baseLoc.z, ease:Quad.easeOut});
		// 	TweenMax.to(this.material, speedAnim/2, {opacity: 0, ease:Quad.easeOut, delay: speedAnim/2});
		// });

		// SPHERE SCALE + ROTATION -> transition
		var newScale = 2.8;
		if(sphere.rotation.x == 90 * Math.PI / 180 && sphere.rotation.y == 0) {
			TweenMax.to(sphere.scale, .8, {x: newScale, y: newScale, z: newScale, ease:Quad.easeInOut});
			TweenMax.to(sphere.rotation, .8, {z: "+=2", ease:Quad.easeInOut});
			$.each(sphere.children, function() {
				TweenMax.to(this.material, .8/2, {opacity: 0, ease:Quad.easeOut, delay: .8/4});
			});
		} else {
			TweenMax.to(sphere.rotation, .6, {x: 90 * Math.PI / 180, y: 0, ease:Quad.easeInOut});
			TweenMax.to(sphere.scale, .8, {x: newScale, y: newScale, z: newScale, ease:Quad.easeInOut, delay: .5});
			TweenMax.to(sphere.rotation, .8, {z: "+=2", ease:Quad.easeInOut, delay: .5});
			$.each(sphere.children, function() {
				TweenMax.to(this.material, .8/2, {opacity: 0, ease:Quad.easeOut, delay: .8/4+.5});
			});
		}

	}

	function filterMarker(typeToShow) {
		if(typeToShow != "all" && typeToShow != "outAnim") {
			$.each(sphere.children, function() {
				if(this.type != typeToShow) {
					TweenMax.to(this.material, .2, {opacity: 0, ease:Quad.easeOut});
				} else {
					TweenMax.to(this.material, .2, {opacity: 1, ease:Quad.easeOut});
				}
			});
		} else if (typeToShow == "outAnim") {
			doOutAnim();
		} else if (typeToShow == "all") {
			$.each(sphere.children, function() {
				TweenMax.to(this.material, .2, {opacity: 1, ease:Quad.easeOut});
			});
		}
	}

	var raycaster,mouse;

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	function onDocumentMouseDown(event) {
		event.preventDefault();
		MOUSE_IS_DOWN = true;

		MOUSECLIC_X = event.clientX;
		MOUSECLIC_Y = event.clientY;

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		// DETECT CLIC ON MAPS's PINS
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( clicableObjects );
		if ( intersects.length > 0 ) {

			// Si clic sur pin -> direction sur la pin
			// changeLocalisation(intersects[ 0 ].object.loc);
		}
	}

	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	function onDocumentMouseUp(event) {
		event.preventDefault();
		MOUSE_IS_DOWN = false;
	}

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove(event) {
		if(!MOUSE_IS_DOWN) {
			return;
		}

		event.preventDefault();
		// WAIT_BEFORE_ROTATE = WAIT_BEFORE_ROTATE_TIME;
		var deltaX = event.clientX - MOUSECLIC_X;
		var deltaY = event.clientY - MOUSECLIC_Y;
		MOUSECLIC_X = event.clientX;
		MOUSECLIC_Y = event.clientY;

		sphere.rotation.y += deltaX * Math.PI / 180;
		sphere.rotation.x += deltaY * Math.PI / 180;
	}

});