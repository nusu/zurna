'use strict';
var os 			= require('os'),
	ifaces 		= os.networkInterfaces(),
	express 	= require('express'),
	path		= require('path'),
	hbs			= require('hbs'),
	config		= require('./config'),
	exec 		= require('child_process').exec;


//
// get current ip
//
require('dns').lookup(require('os').hostname(), function (err, add, fam) {

	console.log('spotify is ready to arrange songs right now \n your friends can acces interface via \n Extarnal UI: '+add+':3000');

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

app.get('/play', function(req,res){

	res.send(req.params.uri);

	function puts(error, stdout, stderr) { console.log(stdout) }
	exec("spotify play uri $URI", {env: {'URI': req.param('uri')}}, puts);

})

setInterval(function () {
    console.log('timeout completed'); 
}, 1000); 

app.listen(3079, function () {
  console.log('spotify app listening on port 3079!');
})



//
// check spotify status
//
