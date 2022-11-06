const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const {inspect} = require('util');

var users = [];
var usersName = [];

// Si el usuario existe que ponga otro nombre
function userNotExist(userName, socketID) {
    if (userName === undefined || userName === null || userName === "server") 
        return false;

    var result = true;

    users.forEach(user => {
        if (user.name === userName) {
            result = false;
        }
    });

    if (result) {
        users.push({
            name: userName,
            id: socketID
        });
        appendUser(userName);
    }
    return result;
}

function appendUser(userName) {
    usersName.push(userName);
}

// Eliminar el usuario del servidor cuando se salga
function deleteUser(userName) {
    for( var i = 0; i < users.length; i++){ 
        if ( users[i].name === userName) { 
            users.splice(i, 1);
            usersName.splice(i, 1);
        }
    }
}

function findClientID(userName) {
    for( var i = 0; i < users.length; i++){ 
        if ( users[i].name === userName) { 
            return users[i].id; 
        }
    }
    return undefined;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

    // Usuario se conecta e ingresa nombre de usuario
    socket.on('chat connect', (user) => {
        console.log('usuario: ' + user);
        if (userNotExist(user, socket.id)) {
            socket.user = user;
            console.log('User: <' + socket.user + '> connected');

            //Enviar mensaje a los usuarios de quien se conecta y cuantos estan conectados
            io.emit('chat message', '<server> User: <' + socket.user + '> connected');
            io.emit('chat message', '<server> Usuarios conectados: ' + usersName);

            console.log("Usuarios conectados: " + inspect(usersName));
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

        console.log("Usuarios conectados: " + inspect(usersName));
        //Enviar mensaje a los usuarios de quien se ha desconectado y cuantos estan conectados
        io.emit('chat message', '<server> User: <' + socket.user + '> disconnected');
        io.emit('chat message', '<server> Usuarios conectados: ' + usersName);
    });
    
    // Usuario envia mensaje global
    socket.on('chat message', (msg) => {
        console.log('message from ' + socket.user + ': ' + msg);
        socket.broadcast.emit('chat message', '<' + socket.user + '>' + msg);
        //socket.emit('chat message', '<' + socket.user + '>' + msg);
    });

    //Privado a una persona en concreto
    socket.on('private', (user, msg) => {
        var socketID = 0;
        if ((socketID = findClientID(user)) !== undefined) {
            console.log("Message private---> " + msg);
            io.to(socketID).emit('chat message', msg);
        }
        else {
            console.log("No existe tal usuario: <" + user + ">");
        }
    });

    //Privado a una persona en concreto
    /*socket.on('private', (user, msg) => {
        console.log("Hola priavte")
        io.emit('chat message', 'privado de <' + socket.user + '> ' + msg);
    });*/
});

const port = 8000;

server.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});