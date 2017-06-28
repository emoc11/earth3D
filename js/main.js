$(function() {

	// ETOILES AUTOUR
	// FLARE ATOUR DE LA PLANETE

	// Animation variables
	var EARTH_ROTATE = true;

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
	    document.querySelector('#earth');

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
	var RADIUS = 100;
	var SEGMENTS = 32;
	var RINGS = 32;

	// Create a new mesh with
	// sphere geometry
	var textureLoader = new THREE.TextureLoader();
	earth = new THREE.Mesh(
		new THREE.SphereGeometry(RADIUS, SEGMENTS, RINGS),
		new THREE.MeshPhongMaterial({
			map: textureLoader.load('img/earthmapnasa.jpg'),
			bumpMap: textureLoader.load('img/earthbump1k.jpg'),
			bumpScale:   0.05,
			specularMap: textureLoader.load('img/earthspec1k.jpg'),
			specular: new THREE.Color('grey'),
			shininess: 10
		})
	);

	// Move the Sphere back in Z so we
	// can see it.
	earth.position.z = -300;
	earth.rotation.x = 15 * Math.PI / 180;
	earth.rotation.y = 0;

	// Mouse orbit control

	// Finally, add the sphere to the scene.
	scene.add(earth);

	// Create clouds sphere
	var cloudGeo = new THREE.SphereGeometry(RADIUS+.8, SEGMENTS, RINGS);
	var cloudMat = new THREE.MeshPhongMaterial({
			map: textureLoader.load('img/earthclouds.png'),
			side: THREE.DoubleSide,
			opacity: 0.8,
			transparent: true,
			depthWrite: false
	});
	var cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);

	// Add clouds to earth
	earth.add(cloudMesh);

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
	// Add clouds to earth
	scene.add(skyMesh);

	// SUPER SIMPLE GLOW EFFECT
	// use sprite because it appears the same from all angles
	var spriteMaterial = new THREE.SpriteMaterial(
	{
		map: textureLoader.load( 'img/glow.png' ),
		color: 0xFFFFFF,
		transparent: false,
		blending: THREE.AdditiveBlending
	});
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(245, 245, 1.0);
	sprite.lookAt(earth.position);
	earth.add(sprite); // this centers the glow at the mesh

	// Add Light
	var light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
	scene.add( light );


	var spotLight = new THREE.SpotLight(0xffffff, .4, 400, 10, 2);
	scene.add(spotLight);

	// DRAW !
	function render() {
		renderer.render(scene, camera);
	}

	function update () {
		requestAnimationFrame(update);

		// Clouds rotation
		cloudMesh.rotation.y  += 0.0003;

		TWEEN.update();

		if (EARTH_ROTATE) {
			earth.rotation.y -= 1/32 * 0.05;
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

	function getLatLon(location, callback) {
		var encodedLocation = location.replace(/\s/g, '+');
		var httpRequest = new XMLHttpRequest();

		console.log(encodedLocation);

		httpRequest.open('GET', 'https://maps.googleapis.com/maps/api/geocode/json?address=' + encodedLocation);
		httpRequest.send(null);
		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4 && httpRequest.status == 200) {
				var result = JSON.parse(httpRequest.responseText);

				if (result.results.length > 0) {
					var latitude = result.results[0].geometry.location.lat;
					var longitude = result.results[0].geometry.location.lng;

					var res = latitude+","+longitude;

					callback(res);
				}
			}
		};
	}

	function changeLocalisation(localisation) {
		var latLon = localisation.split(",");
		var lat = latLon[0];
		var lon = latLon[1];

		var verticalOffset = 0.1;

		var longToDest = 270 - lon;
		EARTH_ROTATE = false;
		rotateOnGoodSide(longToDest);
	}

	function rotateOnGoodSide( targetDegree ){
		var currentYRotation = earth.rotation.y * 180 / Math.PI;

		// Nicely refacto degree to min 0° and max 360°
		currentYRotation = niceDegree(currentYRotation);
		targetDegree = niceDegree(targetDegree);

		var angleToGo = 0;

		if((targetDegree-currentYRotation) > 180) {
			angleToGo = (360 - (targetDegree-currentYRotation)) * (Math.PI / 180);
			TweenMax.to(earth.rotation, .3, {y: "-="+angleToGo, ease: Quad.easeOut});
		} else {
			angleToGo = ((targetDegree-currentYRotation)) * (Math.PI / 180);
			TweenMax.to(earth.rotation, .3, {y: "+="+angleToGo, ease: Quad.easeOut});
		}
	}

	function niceDegree(deg) {
		if(deg >= 360) {
			deg = deg - (Math.trunc((deg/360)) * 360);
		} else if(deg < 0) {
			deg = 360 + (deg + ((Math.trunc(Math.abs(deg)/360)) * 360));
		}
		return deg;
	}

	function convertLatLonToVec3 ( lat, lon ) {
		lat =  lat * Math.PI / 180.0;
		lon = -lon * Math.PI / 180.0;
		return new THREE.Vector3(
			Math.cos(lat) * Math.cos(lon),
			Math.sin(lat),
			Math.cos(lat) * Math.sin(lon));
	}

	function placeMarker(localisation) {
		var latLon = localisation.split(",");
		var lat = latLon[0];
		var lon = latLon[1];

		var latLonPos = convertLatLonToVec3(lat, lon);
		latLonPos.multiplyScalar(RADIUS-1);

		var marker = new THREE.Mesh(
			new THREE.SphereGeometry(1.4,16,16),
			new THREE.MeshBasicMaterial({color:0xFF0000})
		);

		marker.position.copy(latLonPos);
		marker.loc = lat+","+lon;

		earth.add(marker);
		clicableObjects.push(marker);
	}

	$("nav li.city").each(function() {
		getLatLon($(this).text(), function(latLon) {
			placeMarker(latLon);
		});
	});

	$("nav li.city").bind("click", function() {
		getLatLon($(this).text(), function(latLon) {
			changeLocalisation(latLon);
		});
	});

	$("nav li.backToAutoRotate").bind("click", function() {
		EARTH_ROTATE = true;
	});

	var raycaster,mouse;

	raycaster = new THREE.Raycaster();
	mouse = new THREE.Vector2();

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	function onDocumentMouseDown(event) {
		event.preventDefault();
		MOUSE_IS_DOWN = true;

		MOUSECLIC_X = event.clientX;
		MOUSECLIC_Y = event.clientY;$

		mouse.x = ( event.clientX / renderer.domElement.clientWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / renderer.domElement.clientHeight ) * 2 + 1;

		// DETECT CLIC ON MAPS's PINS
		raycaster.setFromCamera( mouse, camera );
		var intersects = raycaster.intersectObjects( clicableObjects );
		if ( intersects.length > 0 ) {
			// Si clic sur pin -> direction sur la pin
			changeLocalisation(intersects[ 0 ].object.loc);
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
		var deltaX = event.clientX - MOUSECLIC_X;
		MOUSECLIC_X = event.clientX;
		MOUSECLIC_Y = event.clientY;

		earth.rotation.y += deltaX * Math.PI / 180;
	}

});