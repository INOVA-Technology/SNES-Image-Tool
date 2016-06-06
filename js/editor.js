"use strict";

var editor = document.getElementById("editor");
var canvas = editor;
editor.width = 400;
editor.height = 400;

var ctx = editor.getContext("2d");

// the editors width and height should be divisible by pixelSize
var pixelSize = 20;

var pixelsDrawn = [];
var pixelsX = editor.width / pixelSize;
var pixelsY = editor.height / pixelSize;
for (var i = 0; i < pixelsY; i++) {
	var row = [];
	for (var j = 0; j < pixelsX; j++) {
		// null is transparent, 0 is color 0, 1 is color 1, etc...
		row.push(null);
	}
	pixelsDrawn.push(row);
}

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

var canRedrawCheckbox = document.getElementById("canRedraw");
var canRedraw = canRedrawCheckbox.checked;
canRedrawCheckbox.addEventListener("change", function() {
	canRedraw = canRedrawCheckbox.checked;
});

var colorPalette = ["black", "blue", "red", "green"]

function drawPixelWithEvent(e) {
	var coords = getMouseCoords(canvas, e);

	var xCoord = Math.floor(coords.x / pixelSize)
	var yCoord = Math.floor(coords.y / pixelSize)
	if (!canRedraw && pixelsDrawn[xCoord][yCoord] !== null) { return }
	var startX = xCoord * pixelSize;
	var startY = yCoord * pixelSize;

	var checkedColor = document.querySelector("input[name='color']:checked").value;
	var colorNum = parseInt(checkedColor, 10);
	var color = colorPalette[colorNum];

	ctx.beginPath();
	ctx.rect(startX, startY, pixelSize, pixelSize);
	ctx.fillStyle = color;
	ctx.fill();

	pixelsDrawn[xCoord][yCoord] = colorNum;
}

canvas.addEventListener("mousemove", function(e) {
	if (isClickingOnCanvas) { drawPixelWithEvent(e); }
});

canvas.addEventListener("click", function(e) {
	drawPixelWithEvent(e);
});



