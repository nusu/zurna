'use strict';
var fs = require('fs');


fs.readFile('./data/storage.txt', 'utf8', function(err, data) {
	
	// get data and collapse it 
	var parts = data.split("\n").slice(1);

	// get current song
	var current = parts[0];
	// delete it
	parts.splice(current, 1);

	// now first element of ${parts} is deleted
	// split lines
	var updated = parts.join("\n");

	// save it
	fs.writeFile('./data/storage.txt', updated, function (err) {
	    if (err) 
	        return console.log(err);
	    console.log('current element deleted');
	});

});