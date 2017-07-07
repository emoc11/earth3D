/*
 * Gestion du CANVAS 2D pour le cercle
*/

var canvas = document.getElementById('circle');
var ctx = canvas.getContext('2d');
var centerX = ($("#circle").innerWidth() / 2);
var centerY = ($("#circle").innerHeight() / 2);

$(function() {

	$(window).on("resize", function() {
		initCanvas();
	});

	function drawPoints(radius, nbPoints, pointSize) {
		var ecartAngle = 360 / nbPoints;

		for (var i = 0; i < nbPoints; i++) {
			var x = centerX + radius * Math.cos(-(i*ecartAngle)*Math.PI/180);
			var y = centerY + radius * Math.sin(-(i*ecartAngle)*Math.PI/180);
			var randColor = Math.round(Math.random() * 2 + 1);

			ctx.beginPath();
		    ctx.arc(x, y, pointSize, 0, 2 * Math.PI);
		    var color = "#000000";
		    switch(randColor) {
		    	case 1:
					color = "#FF0000";
		    		break;
		    	case 2:
					color = "#0000FF";
		    		break;
		    	case 3:
					color = "#00FF00";
		    		break;
		    }
	    	ctx.fillStyle = color;
		    ctx.fill();
		}
	}
	// drawPoints(100, 1);

	function drawRadius(nbCircle, diameterMax, nbPointMax, pointSize) {
		var radiusMax = diameterMax/2;
		var ecartRad = radiusMax / nbCircle;
		var ecartAngleMax = 360 / nbPointMax;

		for (var i = 0; i < nbCircle; i++) {
			var nbPointMaxByRad = nbPointMax - Math.round(i*ecartRad/ecartAngleMax);
			drawPoints(radiusMax-(i*ecartRad), nbPointMaxByRad, pointSize);
		}

	}

	function initCanvas() {
		canvas.width = $(window).innerWidth();
		canvas.height = $(window).innerHeight();
		centerX = ($("#circle").innerWidth() / 2);
		centerY = ($("#circle").innerHeight() / 2);

		drawRadius(15, ($(window).innerHeight()*70/100), 150, 1);
	}
	initCanvas();

});