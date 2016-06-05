"use strict";

var textarea = document.getElementById("img-code");
var imgCode = textarea.innerHTML;

var pixels = [];

var lines = imgCode.split("\n");

var sections_found = 0;

var next_line_color = false;

var colors = [];

function numbersToRow(num1, num2) {
	var num1bin = ("00000000" + num1.toString(2)).slice(-8);
	var num2bin = ("00000000" + num2.toString(2)).slice(-8);
	var vals = [];
	for (var i = 0; i < num1bin.length; i++) {
		var finalBin = num2bin[i] + num1bin[i];
		vals.push(parseInt(finalBin, 2));
	}
	return vals;
}

function allOfTheColorsOfTheWind(color) {
	var binColor = ("0000000000000000" + color.toString(2)).slice(-15);
	var b = parseInt(binColor.substring(0, 5), 2);
	var g = parseInt(binColor.substring(5, 10), 2);
	var r = parseInt(binColor.substring(10, 15), 2);
	// return [r, g, b];
	return [Math.round(r * 255 / 31), Math.round(g * 255 / 31), Math.round(b * 255 / 31)];
}

for (var i = 0; i < lines.length; i++) {
	var line = lines[i];
	var regex = /^\s*\.db (\$[0-9A-F]{2}, ){15}\$[0-9A-F]{2}$/i;
	if (next_line_color) {
		var index = line.indexOf("$");
		var theRest = line.substring(index);
		var values = theRest.split(", ");
		for (var j = 0; j < values.length / 2; j++) {
			var val1 = values[j*2].substring(1);
			var val2 = values[j*2+1].substring(1);
			var num = parseInt(val2 + val1, 16);
			colors.push(allOfTheColorsOfTheWind(num));
		}
		next_line_color = false;

	} else if (line.match(regex)) {
		var index = line.indexOf("$");
		var theRest = line.substring(index);
		var values = theRest.split(", ");
		var currentValues = [];
		var results = []; // the tile
		for (var j = 0; j < values.length; j++) {
			var num = parseInt(values[j].substring(1), 16);
			currentValues.push(num);
			if (currentValues.length === 2) {
				results.push(numbersToRow(currentValues[0], currentValues[1]));
				currentValues = [];
			}
		}
		pixels.push(results);
	} else if (line.match(/^[a-z]+:\s*$/i)) {
		sections_found++;
		if (sections_found === 2) {
			next_line_color = true;
		}
	}
}

var easel = document.getElementById("easel");
var ctx = easel.getContext("2d");

var pixelScale = 1;

var tile_pos_x = 0;
var tile_pos_y = 0;
for (var i = 0; i < pixels.length; i++) {
	var tile = pixels[i];
	for (var j = 0; j < tile.length; j++) {
		var row = tile[j];
		for (var k = 0; k < row.length; k++) {
			var pixel = row[k];
			var id = ctx.createImageData(pixelScale, pixelScale);
			id.data[0] = colors[pixel][0];
			id.data[1] = colors[pixel][1];
			id.data[2] = colors[pixel][2];
			id.data[3] = 255;

			var x = tile_pos_x * 8 * pixelScale + k * pixelScale;
			var y = tile_pos_y * 8 * pixelScale + j * pixelScale;
			
			ctx.putImageData(id, x, y);
		}
	}
	tile_pos_x++;
	if (tile_pos_x === 16) {
		tile_pos_x = 0;
		tile_pos_y++;
	}
}
