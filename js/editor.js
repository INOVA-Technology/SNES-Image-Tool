"use strict";

var editor = document.getElementById("editor");
var canvas = editor;
editor.width = 320;
editor.height = 320;

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
		row.push(0);
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

//.db $FF, $12, $55, $55, $87, $34, $0F, $FF
var colorPalette = ["#ffffff", "#0000ff", "#ff0000", "#00ff00"];

for (let i = 0; i < colorPalette.length; i++) {
	const e = document.getElementById("color-view-" + i.toString());
	e.style.backgroundColor = colorPalette[i];
	const l = document.getElementById("color-label-" + i.toString());
	l.textContent = colorPalette[i];
	const c = document.getElementById("colorz-yo-" + i.toString());
	c.value = colorPalette[i];
	c.addEventListener("change", function() {
		colorPalette[i] = c.value;
		l.textContent = colorPalette[i];
		e.style.backgroundColor = colorPalette[i];
		drawTodosLosPixels();
	});
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

function drawTodosLosPixels() {
	for (let x = 0; x < pixelsDrawn.length; x++) {
		for (let y = 0; y < pixelsDrawn[x].length; y++) {
			drawPixel(x, y, colorPalette[pixelsDrawn[x][y]]);
		}
	}
}

canvas.addEventListener("mousemove", function(e) {
	if (isClickingOnCanvas) { drawPixelWithEvent(e); }
});

canvas.addEventListener("click", function(e) {
	drawPixelWithEvent(e);
});

function padNumber(n, zeros) {
	let str = "";
	const nStr = n.toString();
	const count = zeros - nStr.length;
	for (let i = 0; i < count; i++) {
		str += "0";
	}
	return str + nStr;
}

// currently broken/not done
function exportImage() {
	let chunks = [];
	for (let y = 0; y < pixelsDrawn.length; y++) {
		let ary = [];
		for (let x = 0; x < pixelsDrawn[0].length / 4; x++) {
			ary.push("");
		}
		chunks.push(ary)
	}

	for (let y = 0; y < pixelsDrawn.length; y++) {
		for (let x = 0; x < pixelsDrawn[0].length; x++) {
			const col = Math.floor(x / 8);
			const row = y;
			let colorNum = pixelsDrawn[x][y];
			if (colorNum === null) colorNum = 0;

			const bits = padNumber(colorNum.toString(2), 2).split("");
			chunks[row][col * 2] += bits[1];
			chunks[row][col * 2 + 1] += bits[0];

			
			//row.reduce(function(daByte, pixel) {
				//const binColorNum = padNumber(pixel, 2);
				//return daByte;
			//}, ["", ""]);
		}
	}

	console.log(chunks.length);

	let imageData = "";
	for (let yy = 0; yy < chunks.length; yy += 8) {
		for (let x = 0; x < chunks[0].length; x += 2) {
			imageData += ".db ";
			for (let y = 0; y < 8; y++) {
				imageData += "$" + padNumber(parseInt(chunks[y + yy][x], 2).toString(16), 2) + ", ";
				imageData += "$" + padNumber(parseInt(chunks[y + yy][x + 1], 2).toString(16), 2) + ", ";
			}
			imageData = imageData.slice(0, imageData.length - 2);
			imageData += "\n";
		}
	}
	//for (let y = 0; y < pixelsDrawn[0].length; y += 8) {
		//for (let x = 0; x < pixelsDrawn[0].length; x += 2) {
			//imageData += ".db ";
			//for (let yy = 0; yy < 8; yy++) {
				//imageData += "$" + padNumber(parseInt(chunks[y][x], 2).toString(16), 2) + ", ";
				//imageData += "$" + padNumber(parseInt(chunks[y][x + 1], 2).toString(16), 2) + ", ";
			//}
			//imageData = imageData.slice(0, imageData.length - 2);
			//imageData += "\n";
		//}
	//}

	return imageData;
}
//exportImage();

// 

