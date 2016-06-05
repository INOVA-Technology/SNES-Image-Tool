"use strict";

var editor = document.getElementById("editor");
var canvas = editor;
editor.width = 400;
editor.height = 400;

var ctx = editor.getContext("2d");

// the editors width and height should be divisible by pixelSize
var pixelSize = 20;

for (var x = pixelSize; x < editor.width; x += pixelSize) {
	ctx.beginPath();
	ctx.moveTo(x, 0);
	ctx.lineTo(x, editor.height);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "gray";
	ctx.stroke();
}

for (var y = pixelSize; y < editor.width; y += pixelSize) {
	ctx.beginPath();
	ctx.moveTo(0, y);
	ctx.lineTo(editor.width, y);
	ctx.lineWidth = 1;
	ctx.strokeStyle = "gray";
	ctx.stroke();
}

function getMouseCoords(canvas, e) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: (e.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
		y: (e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height
	}
}

var isClickingOnCanvas = false;

canvas.addEventListener("mousedown", function() { isClickingOnCanvas = true; });
canvas.addEventListener("mouseup", function() { isClickingOnCanvas = false; });
canvas.addEventListener("mouseleave", function() { isClickingOnCanvas = false; });

function drawPixelWithEvent(e) {
	var coords = getMouseCoords(canvas, e);
	var startX = Math.floor(coords.x / pixelSize) * pixelSize;
	var startY = Math.floor(coords.y / pixelSize) * pixelSize;

	ctx.beginPath();
	ctx.rect(startX, startY, pixelSize, pixelSize);
	if($('#black').is(':checked')) { ctx.fillStyle = "black"; }
	if($('#blue').is(':checked')) { ctx.fillStyle = "blue"; }
	if($('#red').is(':checked')) { ctx.fillStyle = "red"; }
	if($('#green').is(':checked')) { ctx.fillStyle = "green"; }
	ctx.fill();
}

canvas.addEventListener("mousemove", function(e) {
	if (isClickingOnCanvas) { drawPixelWithEvent(e); }
});

canvas.addEventListener("click", function(e) {
	drawPixelWithEvent(e);
});



