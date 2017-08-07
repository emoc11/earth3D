Sphere = function() {
	this.init = function($container, settings) {

		// Other variables
		this.MOUSE_IS_DOWN = false;

		// Animation variables
		this.pointHoverAnim = settings.pointHoverAnim || false;
		if(this.pointHoverAnim) {
			this.interactivObjects = [];
			this.littlePointMoving = [];
			this.pointNeedToMove = [];
			this.circlOnPoint = [];
			this.distCircPoints = [];
			this.lastPointHover;
			this.maxDistanceMove = settings.maxHoverDistanceMove || 10;
			this.hoverCirc;
			this.wasNotOnHoverState = true;
		}

		this.SPHERE_SCALE_CHANGE = settings.sphereSizeAnim || false;
		if(this.SPHERE_SCALE_CHANGE) {
			this.maxScaleSphere = 1.03;
			this.minScaleSphere = 1;
			this.sphereNeedToBeLittle = false;
			this.sphereScaleChanging = .0001;
			this.SPHERE_SCALE = 1;
			this.SPHERE_AUTO_ROTATE = true;
		}

		// Sphere settings
		this.sphereSettings = settings.sphereSettings || {
			radius: 40,
			segments: 50,
			rings: 50,
		};
		this.sphereSettings.position = settings.sphereSettings.position || {
			x: 0,
			y: 0,
			z: -170,
		}
		this.sphereSettings.material = settings.sphereSettings.material || {
			color: 0x1a15cb,
			wireframe: false,
			transparent: false,
			opacity: 0,
			shininess: 0,
		}

		// Scene + renderer variables
		this.renderWidth = $(window).innerWidth();
		this.renderHeight = $(window).innerHeight();
		this.renderColor = settings.renderColor || 0xFFFFFF;
		this.renderAlpha = settings.renderAlpha || 0;

		// Camera settings
		this.VIEW_ANGLE = 45;
		this.ASPECT = WIDTH / HEIGHT;
		this.NEAR = 0.1;
		this.FAR = 10000;

		// Get the DOM element to attach to
		this.$container = $container;

		this.initRenderer();
		this.initScene();
		this.initCamera();
	}

	this.initRenderer = function() {
		if(this.renderAlpha != 1) {
			this.renderer = new THREE.WebGLRenderer({alpha: true, antialiasing: true});
		} else {
			this.renderer = new THREE.WebGLRenderer({antialiasing: true});
		}
		this.renderer.setClearColor (this.renderColor, this.renderAlpha);
		this.renderer.setSize(this.renderWidth, this.renderHeight);

		this.container.append(this.renderer.domElement);
	}

	this.initScene = function () {
		this.scene = new THREE.Scene();
	}

	this.initSphere = function () {
		this.RADIUS = this.sphereSettings.radius;
		this.SEGMENTS = this.sphereSettings.semgents;
		this.RINGS = this.sphereSettings.rings;

		this.textureLoader = new THREE.TextureLoader();
		this.sphereGeometry = new THREE.SphereGeometry(this.RADIUS, this.SEGMENTS, this.RINGS);
		this.sphereMaterial = new THREE.MeshPhongMaterial(this.sphereSettings.material);

		this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

		// Sphere position
		this.sphere.rotation.x = this.sphereSettings.position.x;
		this.sphere.rotation.y = this.sphereSettings.position.y;
		this.sphere.rotation.z = this.sphereSettings.position.z;

		this.scene.add(this.sphere);
	}

	this.initCamera = function() {
		this.camera = new THREE.PerspectiveCamera(
	        this.VIEW_ANGLE,
	        this.ASPECT,
	        this.NEAR,
	        this.FAR
	    );

		this.scene.add(this.camera);
	}
}