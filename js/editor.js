"use strict";

const canvas = document.getElementById("editor");
const ctx = editor.getContext("2d");

const displayedCanvasSize = { width: 320, height: 320 };

// the canvas's width and height should be divisible by pixelSize
const pixelSize = 20;
const pixelsX = displayedCanvasSize.width / pixelSize;
const pixelsY = displayedCanvasSize.height / pixelSize;

const canRedrawCheckbox = document.getElementById("canRedraw");
let canRedraw = canRedrawCheckbox.checked;
canRedrawCheckbox.addEventListener("change", () => {
	canRedraw = canRedrawCheckbox.checked;
});


const savedStatus = document.getElementById("work-saved");
const unsavedStatus = document.getElementById("work-unsaved");
const saveButton = document.getElementById("save-drawing");
let drawingIsSaved;
saveButton.addEventListener("click", () => {
	// todo: save color palette too
	updateSavedStatus(true)
	setSetting("drawing", pixelsDrawn);
});

const canvasScale = isRetinaDisplay() ? 2 : 1;

// if the device has retina display, `canvas.width' and `canvas.height'
// will be twice the size of `displayedCanvasSize' 
canvas.width = displayedCanvasSize.width * canvasScale;
canvas.height = displayedCanvasSize.height * canvasScale;
canvas.style.width = `${displayedCanvasSize.width}px`;
canvas.style.height = `${displayedCanvasSize.height}px`;
ctx.scale(canvasScale, canvasScale);

function updateSavedStatus(bool) {
	drawingIsSaved = bool;
	unsavedStatus.hidden = drawingIsSaved;
	savedStatus.hidden = !drawingIsSaved;
}

let isClickingOnCanvas = false;
canvas.addEventListener("mousedown", () => { isClickingOnCanvas = true; });
canvas.addEventListener("mouseup", () => { isClickingOnCanvas = false; });
canvas.addEventListener("mouseleave", () => { isClickingOnCanvas = false; });

let pixelsDrawn = getSetting("drawing", () => {
	let pixelsDrawn = [];
	for (let i = 0; i < pixelsY; i++) {
		let row = [];
		for (let j = 0; j < pixelsX; j++) {
			row.push(0);
		}
		pixelsDrawn.push(row);
	}
	return pixelsDrawn;
});

canvas.addEventListener("mousemove", (e) => {
	if (isClickingOnCanvas) { drawPixelWithEvent(e); }
});

canvas.addEventListener("click", (e) => {
	drawPixelWithEvent(e);
});

const exportButton = document.getElementById("export-image");
exportButton.addEventListener("click", () => {
	const imageData = exportImage();
	const downloader = document.createElement("a");
	downloader.href = URL.createObjectURL(new Blob([imageData], { type: 'text' }));
	downloader.download = "image.inc";

	document.body.appendChild(downloader);
	downloader.click();
	document.body.removeChild(downloader);
});

let colorPalette = ["#ffffff", "#0000ff", "#ff0000", "#00ff00"];
for (let i = 0; i < colorPalette.length; i++) {
	const e = document.getElementById("color-view-" + i.toString());
	e.style.backgroundColor = colorPalette[i];
	const l = document.getElementById("color-label-" + i.toString());
	l.textContent = colorPalette[i];
	const c = document.getElementById("colorz-yo-" + i.toString());
	c.value = colorPalette[i];
	c.addEventListener("change", () => {
		colorPalette[i] = c.value;
		l.textContent = colorPalette[i];
		e.style.backgroundColor = colorPalette[i];
		drawTodosLosPixels();
	});
}

function drawGrid() {
	for (let x = pixelSize; x < displayedCanvasSize.width; x += pixelSize) {
		ctx.beginPath();
		ctx.moveTo(x, 0);
		ctx.lineTo(x, displayedCanvasSize.height);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "gray";
		ctx.stroke();
	}

	for (let y = pixelSize; y < displayedCanvasSize.height; y += pixelSize) {
		ctx.beginPath();
		ctx.moveTo(0, y);
		ctx.lineTo(displayedCanvasSize.width, y);
		ctx.lineWidth = 1;
		ctx.strokeStyle = "gray";
		ctx.stroke();
	}
	console.log("heh?");
}

// todo: use `drawPixel'
function drawPixelWithEvent(e) {
	const coords = getMouseCoords(canvas, e);

	const xCoord = Math.floor(coords.x / canvasScale / pixelSize)
	const yCoord = Math.floor(coords.y / canvasScale / pixelSize)
	if (!canRedraw && pixelsDrawn[xCoord][yCoord] !== 0) { return }
	const startX = xCoord * pixelSize;
	const startY = yCoord * pixelSize;

	const checkedColor = document.querySelector("input[name='color']:checked").value;
	const colorNum = parseInt(checkedColor, 10);
	const color = colorPalette[colorNum];

	ctx.beginPath();
	ctx.rect(startX, startY, pixelSize, pixelSize);
	ctx.fillStyle = color;
	ctx.fill();

	drawPixelBoundry(xCoord, yCoord);

	if (drawingIsSaved && pixelsDrawn[xCoord][yCoord] !== colorNum) {
		updateSavedStatus(false);
	}

	pixelsDrawn[xCoord][yCoord] = colorNum;
}

function drawPixel(x, y, color) {
	const startX = x * pixelSize;
	const startY = y * pixelSize;
	ctx.beginPath();
	ctx.rect(startX, startY, pixelSize, pixelSize);
	ctx.fillStyle = color;
	ctx.fill();
}

function drawPixelBoundry(x, y) {
	ctx.beginPath();
	ctx.moveTo(x * pixelSize, y * pixelSize);
	ctx.lineTo((x + 1) * pixelSize, y * pixelSize);
	ctx.lineTo((x + 1) * pixelSize, (y + 1) * pixelSize);
	ctx.lineTo(x * pixelSize, (y + 1) * pixelSize);
	ctx.lineTo(x * pixelSize, y * pixelSize);

	ctx.lineWidth = 1;
	ctx.strokeStyle = "gray";
	ctx.stroke();
}

function drawTodosLosPixels() {
	ctx.clearRect(0, 0, displayedCanvasSize.width, displayedCanvasSize.height);
	for (let x = 0; x < pixelsDrawn.length; x++) {
		for (let y = 0; y < pixelsDrawn[x].length; y++) {
			drawPixel(x, y, colorPalette[pixelsDrawn[x][y]]);
		}
	}
	drawGrid();
}

function padNumber(n, zeros) {
	let str = "";
	const nStr = n.toString();
	const count = zeros - nStr.length;
	for (let i = 0; i < count; i++) {
		str += "0";
	}
	return str + nStr;
}

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

	return imageData;
}

function isRetinaDisplay() {
	if (window.matchMedia) {
		const mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
		return (mq && mq.matches || (window.devicePixelRatio > 1)); 
	}
}

function getMouseCoords(canvas, e) {
	const rect = canvas.getBoundingClientRect();
	return {
		x: (e.clientX-rect.left)/(rect.right-rect.left)*canvas.width,
		y: (e.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height
	}
}

updateSavedStatus(true);
drawTodosLosPixels();

