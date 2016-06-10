#!/usr/local/bin/node

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

var relator = null,
	pantalla = null,
	colaboradores = [],
	acciones = {
		PREGUNTA : 1,
		DOCUMENTO : 2,
		ACTIVIDAD_MISION : 3,
		ACTIVIDAD_GRUPO : 4,
		ACTIVIDAD_PUZZLE : 5,
		MODULO_REPOSO : 6,
		PREGUNTA_MATRIZ : 7,
		PREGUNTA_DESARROLLO : 8,
		IR_BIENVENIDA : 9,
	},
	grupos = {},
	usuarioActividad = [],
	moduloActual;


function initGrupos(){
	grupos = {
		azul : [],
		rojo : [],
		amarillo : [],
		verde : []
	}
}

initGrupos();

function deslogearUsuario(id){

	for (var i = 0; i < colaboradores.length; i++) {
		if(colaboradores[i].id == id){
			colaboradores.splice(i,1);
			break;
		}

	};
}

io.on('connection', function(socket){
	console.log('Usuario conectado');


	socket.on("registro",function(data){
		var encontrado = false
		for (var i = 0; i < colaboradores.length; i++) {

			if(colaboradores[i].id == data.id){
				encontrado = true;
				break;
			}
		};
		if(!encontrado)
			colaboradores.push(data);

		socket.identificador = data.id;

		console.log("registro",colaboradores);
		
		io.emit("usuariosConectados",getUsuariosConectados());
	});
	socket.on("disconnect",function(){
		if(socket.identificador){
			deslogearUsuario(socket.identificador);
		}

		io.emit("usuariosConectados",getUsuariosConectados());
		console.log("disconnect",getUsuariosConectados());
	});
	socket.on("deslogear",function(id){
		deslogearUsuario(id);

		io.emit("usuariosConectados",getUsuariosConectados());
		console.log("deslogear",getUsuariosConectados());		
	});

	socket.on("usuario_creado_colaborador",function(){
		console.log("usuario_creado_colaborador",getUsuariosConectados());
		io.emit("usuario_creado_relator",getUsuariosConectados());
	});

	socket.on("getUsuariosConectados",function(id){
		var conectados = getUsuariosConectados();
		console.log("Enviando Usuarios conectados",conectados);
		io.emit("usuariosConectados",conectados);
	});


	socket.on("modulo_iniciado",function(data){
		console.log("modulo",data);
		moduloActual = data;

		io.emit("colaborador",{
			accion: acciones.MODULO_REPOSO,
			modulo_id : data.id_modulo,
			modulo_nombre: data.nombre_modulo,
			seccion_id: data.id_seccion,
			seccion_nombre: data.nombre_seccion
		});;
	});
	
	socket.on("presentacion",function(data){
		console.log("presentacion",data);
		io.emit("tv_presentacion",data);
	});
	socket.on("presentacion_off",function(){
		console.log("presentacion_off");
		irBienvenida();
	});


	socket.on("cast_documento",function(id){
		console.log("cast_documento",id);
		socket.emit("reset_cast","");
		io.emit("tv_documento",id);
	});

	socket.on("cast_documento_off",function(){
		console.log("cast_documento_off");
		irBienvenida();	
	});

	socket.on("enviar_documento",function(data){
		console.log("enviar_documento",data);
		
		var peticion = {
			accion: acciones.DOCUMENTO,
			documento : data.documento,
			seccion: data.seccion
		}
		console.log(peticion);

		io.emit("colaborador",peticion);

		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {		
			usuarioActividad[i].completado = false;		
		};
		console.log("usuarios_documento",usuarioActividad);
		socket.emit("usuarios_documento",usuarioActividad);
	});

	socket.on("botar_tablets", function(){
		io.emit("colaborador",{
			accion: acciones.MODULO_REPOSO,
			modulo : data.modulo,
			seccion: data.seccion
		});
	});

	socket.on("documento_leido", function(id){
		console.log("documento_leido", id);
		for (var i = 0; i < usuarioActividad.length; i++) {
			var user = usuarioActividad[i];
			if(user.id == id)
				usuarioActividad[i].completado = true
		};
		console.log("usuarios_pregunta",usuarioActividad);
		io.emit("usuarios_documento",usuarioActividad);
	});

	socket.on("enviar_pregunta",function(id){
		console.log("enviar_pregunta",id);
		io.emit("colaborador",{
			accion: acciones.PREGUNTA,
			pregunta : id
		});
		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {		
			usuarioActividad[i].completado = false;		
		};
		console.log("usuarios_pregunta",usuarioActividad);
		socket.emit("usuarios_pregunta",usuarioActividad);
	});

	socket.on("responder_pregunta",function(id){
		console.log("responder_pregunta",id);
		for (var i = 0; i < usuarioActividad.length; i++) {
			var user = usuarioActividad[i];
			if(user.id == id)
				usuarioActividad[i].completado = true
		};
		console.log("usuarios_pregunta",usuarioActividad);
		io.emit("usuarios_pregunta",usuarioActividad);
	});


	socket.on("enviar_pregunta_matriz",function(id){
		console.log("enviar_pregunta_matriz",id);
		io.emit("colaborador",{
			accion: acciones.PREGUNTA_MATRIZ,
			pregunta : id
		});
		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {		
			usuarioActividad[i].completado = false;		
		};
		console.log("usuarios_pregunta_matriz",usuarioActividad);
		socket.emit("usuarios_pregunta_matriz",usuarioActividad);
	});

	socket.on("responder_pregunta_matriz",function(id){
		console.log("responder_pregunta_matriz",id);
		for (var i = 0; i < usuarioActividad.length; i++) {
			var user = usuarioActividad[i];
			if(user.id == id)
				usuarioActividad[i].completado = true
		};
		console.log("usuarios_pregunta_matriz",usuarioActividad);
		io.emit("usuarios_pregunta_matriz",usuarioActividad);
	});

	socket.on("enviar_pregunta_desarrollo",function(id){
		console.log("enviar_pregunta_desarrollo",id);
		io.emit("colaborador",{
			accion: acciones.PREGUNTA_DESARROLLO,
			pregunta : id
		});
		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {		
			usuarioActividad[i].completado = false;		
		};
		console.log("usuarios_pregunta_desarrollo",usuarioActividad);
		socket.emit("usuarios_pregunta_desarrollo",usuarioActividad);
	});

	socket.on("responder_pregunta_desarrollo",function(id){
		console.log("responder_pregunta_desarrollo",id);
		for (var i = 0; i < usuarioActividad.length; i++) {
			var user = usuarioActividad[i];
			if(user.id == id)
				usuarioActividad[i].completado = true
		};
		console.log("usuarios_pregunta_desarrollo",usuarioActividad);
		io.emit("usuarios_pregunta_desarrollo",usuarioActividad);
	});





	socket.on("cast_pregunta",function(id){
		console.log("cast_pregunta",id);
		socket.emit("reset_cast","");
		io.emit("tv_pregunta",id);
	});
	socket.on("cast_pregunta_off",function(id){
		console.log("cast_pregunta_off",id);
		irBienvenida();
	});
	socket.on("cast_resultados",function(id){
		console.log("cast_resultados",id);
		socket.emit("reset_cast","");
		io.emit("tv_resultados",id);
	});
	socket.on("cast_resultados_off",function(){
		console.log("cast_resultados_off");
		irBienvenida();
	});

	socket.on("cast_pregunta_matriz",function(id){
		console.log("cast_pregunta_matriz",id);
		socket.emit("reset_cast","");
		io.emit("tv_resultados_matriz",id);
	});



	socket.on("cast_video",function(id){
		console.log("cast_video",id);
		socket.emit("reset_cast","");
		io.emit("tv_video",id);
	});
	socket.on("cast_video_off",function(){
		console.log("cast_video_off");
		irBienvenida();
	});

	socket.on("musica",function(id){
		console.log("musica",id);
		io.emit("tv_musica",id);
	});
	socket.on("musica_off",function(){
		console.log("musica_off");
		io.emit("tv_musica_off");
	});

	socket.on("actividad_mision",function(id){
		console.log("actividad_mision",id);

		initGrupos();
		
		io.emit("colaborador",{
			accion : acciones.ACTIVIDAD_MISION,
			mision : id
		});
		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {		
			usuarioActividad[i].completado = false;		
		};
		console.log("usuarios_pregunta",usuarioActividad);
		socket.emit("usuarios_pregunta",usuarioActividad);
	});

	socket.on("actividad_grupo",function(){
		console.log("actividad_grupo");
		initGrupos();

		io.emit("colaborador",{
			accion : acciones.ACTIVIDAD_GRUPO
		});
	});

	socket.on("actividad_puzzle",function(id){
		console.log("actividad_puzzle",id);

		io.emit("colaborador",{
			accion : acciones.ACTIVIDAD_PUZZLE,
			puzzle_id: id
		});

		usuarioActividad = getUsuariosConectados();
		for (var i = 0; i < usuarioActividad.length; i++) {
			usuarioActividad[i].completado = false;
		};

		socket.emit("usuarios_puzzle",usuarioActividad);
	});

	socket.on("puzzle_completado",function(id){		
		console.log("puzzle_completado", id);
		for (var i = 0; i < usuarioActividad.length; i++) {
			var user = usuarioActividad[i];
			if(user.id == id)
				user.completado = true;
		};
		console.log(usuarioActividad);
		io.emit("usuarios_puzzle",usuarioActividad);

	});

	function calcularMaximo(){

		var usuariosTotal = getUsuariosConectados().length;
		if(usuariosTotal<=4)
			return 1;

		var maximo = Math.floor(usuariosTotal/4);
		if(usuariosTotal%4 != 0){
			var agregar = usuariosTotal%4;
			for(var k in grupos){
				if(grupos[k].length == (maximo+1)){
					agregar--;
				}
			}
			if(agregar > 0)
				maximo++;
		}
		return maximo;
	}


	socket.on("grupo_registro",function(data){
		console.log("grupo_registro",data);

		var maximo = calcularMaximo();

		if(grupos[data.grupo].length >= maximo){
			socket.emit("grupo_rechazado",data.grupo);
			return;
		}else{
			socket.emit("grupo_aceptado",{
				color : data.grupo
			});
		}
		grupos[data.grupo].push({
			id: data.usuario,
			nombres: data.usuario_nombres
		});

		if(grupos[data.grupo].length >= maximo){
			console.log("grupo_cerrado",data.grupo);
			io.emit("grupo_cerrado",data.grupo);
		}

		//de prueba
		setTimeout(function(){
			notificarGrupos(data.grupo);
		},1000);
	});

	socket.on("grupo_enviar_orden",function(data){
		console.log("grupo_orden",data);
		io.emit("grupos_orden",data);
	});

	socket.on("fromColaborador",function(data){
		console.log(socket.id);
		console.log(data);
	});


	socket.on("mensaje",function(mensaje){
		console.log(mensaje);
		io.emit("android",{"mensaje": mensaje});
	});
	socket.on("colaborador_bienvenida",function(){
		io.emit("colaborador",{
			accion : acciones.IR_BIENVENIDA
		});
		console.log("colaborador_bienvenida");
	});
});

function notificarGrupos(grupo){
	io.emit("update_integrantes",{
		grupo: grupo,
		integrantes :grupos[grupo]		
	});
}

function getUsuariosConectados(){
	return colaboradores;
}

function irBienvenida(){
	io.emit("ir_bienvenida");
}

http.listen(3000, function(){
	console.log('Ejecutando en *:3000');
});