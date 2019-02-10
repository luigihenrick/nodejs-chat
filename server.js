var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var port = process.env.PORT || 8080;

users = [];
connections = [];

server.listen(port);
console.log(`Servidor rodando na porta ${port}...`);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
});

io.sockets.on('connection', function(socket){
    connections.push(socket);
    console.log(`Conectado: ${connections.length} sockets conectados`);

    socket.on('disconnect', function(data){
        connections.splice(connections.indexOf(socket), 1);
        console.log(`Desconectado: ${connections.length} sockets conectados`);
        if(!socket.username){
            return;
        }
        users.splice(users.indexOf(socket.username, 1));
        updateUsernames();
    });

    socket.on('send message', function(data){
        io.sockets.emit('new message', {msg: data, user: socket.username});
        console.log(`${socket.username}: ${data}`);
    });

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