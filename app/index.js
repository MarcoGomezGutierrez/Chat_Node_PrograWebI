const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

var users = [];

// Si el usuario existe que ponga otro nombre
function userNotExist(userName) {
    if (userName === undefined || userName === null || userName === "server") 
        return false;

    var result = true;

    users.forEach(user => {
        if (user === userName) {
            result = false;
        }
    });

    if (result) {
        users.push(userName);
    }
    return result;
}

// Eliminar el usuario del servidor cuando se salga
function deleteUser(userName) {
    for( var i = 0; i < users.length; i++){ 
        if ( users[i] === userName) { 
            users.splice(i, 1); 
        }
    }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    // Usuario se conecta e ingresa nombre de usuario
    socket.on('chat connect', (user) => {
        console.log('usuario: ' + user);
        if (userNotExist(user)) {
            socket.user = user;
            console.log('User: <' + socket.user + '> connected');

            //Enviar mensaje a los usuarios de quien se conecta y cuantos estan conectados
            io.emit('chat message', '<server> User: <' + socket.user + '> connected');
            io.emit('chat message', '<server> Usuarios conectados: ' + users);

            console.log("Usuarios conectados: " + users);
        } else if (user !== null) {
            console.log("Usuario repetido");
            io.emit('repetido', user);
        } else {
            console.log("Usuario null no valido");
        }
    })
    
    // Usuario se desconecta y eliminarlo
    socket.on('disconnect', () => {
        console.log('user: '+ socket.user + ' disconnected');

        deleteUser(socket.user); // Eliminar usuario

        console.log("Usuarios conectados: " + users);
        //Enviar mensaje a los usuarios de quien se ha desconectado y cuantos estan conectados
        io.emit('chat message', '<server> User: <' + socket.user + '> disconnected');
        io.emit('chat message', '<server> Usuarios conectados: ' + users);
    });
    
    // Usuario envia mensaje global
    socket.on('chat message', (msg) => {
        console.log('message from ' + socket.user + ': ' + msg);
        socket.broadcast.emit('chat message', '<' + socket.user + '>' + msg);
        //socket.emit('chat message', '<' + socket.user + '>' + msg);
    });

    //Privado a una persona en concreto
    socket.on(socket.user, (msg) => {
        console.log("Message private---> " + msg);
        socket.local.emit('chat message', msg);
    });

    //Privado a una persona en concreto
    /*socket.on('private', (user, msg) => {
        console.log("Hola priavte")
        io.emit('chat message', 'privado de <' + socket.user + '> ' + msg);
    });*/
});

const port = 8000;

server.listen(port, () => {
  console.log('listening on *: ' + port);
});