var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('Usuario conectado');

	socket.on("mensaje",function(mensaje){
		console.log(mensaje);
		socket.emit("nueva pregunta",{"mensaje": mensaje});
		console.log(mensaje);
	});

	/*socket.on('mensaje', function (mensaje) {
		console.log(mensaje);
    // we tell the client to execute 'new message'
    	io.emit('nueva pregunta', {
      pregunta: mensaje
    });
  });*/
});

http.listen(3000, function(){
	console.log('Ejecutando en *:3000');
});