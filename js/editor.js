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


// i just picked aritrary colors for these, I'm aware they look bad
//var colorPalette = ["black", "blue", "red", "green", "orange", "tomato", "#555555", "#888888",
	//"#123456", "#98764", "#112131", "#124349", "#beeeef", "#144114", "#515115", "magenta"];
var colorPalette = ["white", "blue", "red", "green"];

function addEventListenerToLabel(l, span) {
	l.addEventListener("keyup", function() {
		var num = parseInt(l.attributes.for.value.split("-")[1], 10);
		colorPalette[num] = l.textContent;
		span.style.backgroundColor = l.textContent;
		for (var x = 0; x < pixelsDrawn.length; x++) {
			for (var y = 0; y < pixelsDrawn[x].length; y++) {
				if (pixelsDrawn[x][y] === num) {
					console.log(num);
					drawPixel(x, y, l.textContent);
				}
			}
		}
	});
}

var picker = document.getElementById("color-picker");
var label_count = 0;
for (var i = 0; i < picker.children.length; i++) {
	var c = picker.children[i];
	if ("label" == c.tagName.toLowerCase()) {
		var color = colorPalette[label_count++];
		c.textContent = color;
		var span = picker.children[i+1];
		span.style.backgroundColor = color;
		addEventListenerToLabel(c, span);
	}
}

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

function drawPixel(x, y, color) {
	var startX = x * pixelSize;
	var startY = y * pixelSize;
	ctx.beginPath();
	ctx.rect(startX, startY, pixelSize, pixelSize);
	ctx.fillStyle = color;
	ctx.fill();
}

canvas.addEventListener("mousemove", function(e) {
	if (isClickingOnCanvas) { drawPixelWithEvent(e); }
});

canvas.addEventListener("click", function(e) {
	drawPixelWithEvent(e);
});

function padNumber(n, zeros) {
	let str = "";
	const count = zeros - n.length;
	for (let i = 0; i < count; i++) {
		str += "0";
	}
	return str + n;
}

// currently broken/not done
function exportImage() {
	let imageData = "";
	for (let y = 0; y < pixelsDrawn.length; y++) {
		const row = pixelsDrawn[y];
		for (let x = 0; x < row.length; x++) {
			row.reduce(function(daByte, pixel) {

				return daByte;
			}, ["", ""]);
		}
	}
}


