var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);

users = [];
connections = [];

console.log("Servidor rodando na porta 8080...")

server.listen(8080);
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log("Conectado: %s sockets conectados", connections.length);

    // Desconectar
    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log("Desconectado: %s sockets conectados", connections.length);
        if(!socket.username){
            return;
        }
        users.splice(users.indexOf(socket.username, 1));
        updateUsernames();
    });

    // Enviar Mensagem

    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
        console.log(socket.username + ': ' + data);
    });

    // Novo Usuario

    socket.on('new user', function(data, callback){
        callback(true);
        socket.username = data;
        users.push(socket.username);
        updateUsernames();
    });

    function updateUsernames(){
        io.sockets.emit('get users', users);
    };
});