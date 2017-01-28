'use strict';
var os 			= require('os'),
	ifaces 		= os.networkInterfaces(),
	express 	= require('express'),
	path		= require('path'),
	hbs			= require('hbs'),
	config		= require('./config'),
	exec 		= require('child_process').exec,
	spotify 	= require('spotify-node-applescript'),
	fs 			= require('fs');


//
// get current ip
//
require('dns').lookup(require('os').hostname(), function (err, add, fam) {

	console.log('spotify is ready to arrange songs right now \n your friends can acces interface via \n Extarnal UI: '+add+':3079');

})


//
// run express
//
var app = express();

//
// view engine setup
//
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layout' }); // Specify default layout

app.get('/', function(req, res){

	res.render('index', {
		"playUrl" : "localhost:3079/play/"
	});

})

var songDuration;
var songUri;

/*
app.get('/play', function(req,res){

	//res.send(req.params.uri);

	spotify.playTrack(req.param('uri'), function(){
	    // track is playing
	});

	spotify.getTrack(function(err, track){

		songDuration = track.duration;
		res.json(track);

	});

})
*/

app.get('/play', function( req,res ){
	
	fs.readFile('./data/storage.txt', 'utf8', function(err, data) {

		// get data and collapse it 
		var parts = data.split("\n").slice(0);

		// get current song
		var current = parts[0];

		spotify.playTrack(current, function(){
		    
		    spotify.getTrack( function(err, track){
		    	songDuration = track.duration;
		    });

		});

		res.json({"status": "playing"});
	});

})

//
// Song Interval
//
spotify.getTrack(function(err, track){

	songDuration = track.duration;
	songUri 	 = track.uri;

});

var songInterval = new Timer(function() {

    spotify.getState(function(err, state){
    
    	//console.log(state);

		var duration = Math.round(songDuration / 1000);
	
		console.log("şarkı uzunluğu: " + duration);
		console.log("şuan:           " + state.position + "\n");


		if( state.position == duration - 3 ){
			console.log("bitti");

			//
			// delete new song
			//

			fs.readFile('./data/storage.txt', 'utf8', function(err, data) {
	
				// get data and collapse it 
				var parts = data.split("\n").slice(0);

				// get current and next song
				var current = parts[0],
					next	= parts[1];

				console.log(parts);

				console.log("merhaba dostum ben orospu cocuguyum şimdi \n şu an çalacağım şarkı: "+current+"\n sonra çalacağım şarkı: "+next );

				// check the 
				// delete it
				parts.splice(current, 1);

				// now first element of ${parts} is deleted
				// split lines
				var updated = parts.join("\n");

				// save it
				fs.writeFile('./data/storage.txt', updated, function (err) {
				    if (err) 
				        return console.log(err);
				    console.log('şu anki şarkı listeden silindi');
				});


				if( next ){

					spotify.playTrack(next, function(){
					   
					    //
						// get next song data
						//
						console.log("çalıyorum");

						spotify.getTrack(function(err, track){

							songDuration = track.duration;
							duration = Math.round(songDuration / 1000);

							console.log(duration);

						});

					});


				}else{

					songInterval.stop();
					console.log("listede şarkı kalmadı dost ateşi");

				}



			});
		}

	});

}, 900);



//
// Add song
//
app.get('/add-song', function(req, res){

	res.redirect('/');
	
	var data;

	// check if there any songs in order
	fs.readFile('./data/storage.txt', 'utf8', function(err, data) {
		var parts = data.split("\n").slice(0);
		var current = parts[0];

		console.log(parts);

		var data = (current ? "\n"+req.param("uri") : req.param("uri"));
	
		console.log(data);

		fs.appendFileSync('./data/storage.txt', data , {encoding: 'utf8'});

		spotify.getTrack(function(err, track){

			songDuration = track.duration;

		});

	});

})



/*var check = setInterval( checkState(), 900); 

function checkState(){

	spotify.getState(function(err, state){
    
    	//console.log(state);

		var duration = Math.round(songDuration / 1000);
	
		console.log("şarkı uzunluğu: " + duration);
		console.log("şuan:           " + state.position + "\n");


		if( state.position == duration - 1 ){
			console.log("bitti");

			clearInterval(check);
		}

	});

}*/


/*
var timer = new Timer(function() {

    spotify.getState(function(err, state){
    
    	//console.log(state);

		var duration = Math.round(songDuration / 1000);
	
		console.log("şarkı uzunluğu: " + duration);
		console.log("şuan:           " + state.position + "\n");


		if( state.position == duration - 1 ){
			console.log("bitti");

			timer.stop();
		}

	});

}, 900); 

*/

function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new interval, stop current interval
    this.reset = function(newT) {
        t = newT;
        return this.stop().start();
    }
}




app.listen(3079, function () {
  console.log('spotify app listening on port 3079!');
})

