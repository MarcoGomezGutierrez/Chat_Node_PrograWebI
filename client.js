var socket = io();
var form = document.getElementById('form');
var input = document.getElementById('input');

//Input del destino, vacio escribe al general, si pones el nombre de usuario de alguien envia mensaje privado a tal usuario
var private = document.getElementById('private');
var installButton = document.getElementById("buttonInstall");
let deferredPrompt;

if (window.matchMedia('(display-mode: standalone)').matches) {

    installButton.style.display = "none";

} else {
    installButton.style.display = "block";
}

async function detectSWUpdate() {
    const registration = await navigator.serviceWorker.ready;
  
    registration.addEventListener("updatefound", event => {
      const newSW = registration.installing;
      newSW.addEventListener("statechange", event => {
        if (newSW.state == "installed") {
           // New service worker is installed, but waiting activation
           window.alert("Nueva actualizacion");
           registration.waiting.postMessage({message: "active"});
        }
      });
    })
  }
  detectSWUpdate();

// Evento submit enviar mensaje
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        if (private.value) { //Enviar mensaje privado
            socket.emit('private', private.value, 'privado de <' + socket.user + '> para <' + private.value + '> ' + input.value);
        } else { // Enviar mensaje general
            socket.emit('chat message', input.value);
        }
        input.value = '';
    }
});

// Registrar el nombre de usuario
socket.on('connect', function(user) {
    user = prompt("Dime tu nombre", "name");
    socket.emit('chat connect', user);
    socket.user = user;
});

// Si se ha repetido el nombre de usuario volver a pedirlo y comprobar que no exista
socket.on('repetido', (user) => {
    user = prompt("Nombre " + user + " esta repetido ingrese otro nombre:", "name");
    socket.user = user;
    socket.emit('chat connect', user);
});

socket.on('chat message', function(msg) {
    var item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
        .register("/serviceWorker.js")
        .then(res => console.log("service worker registered"))
        .catch(err => console.log("service worker not registered", err))
    })
}


window.addEventListener('beforeinstallprompt', (e) => {
    // Prevents the default mini-infobar or install dialog from appearing on mobile
    e.preventDefault();
    deferredPrompt = e;
});


installButton.addEventListener('click', async () => {
    // deferredPrompt is a global variable we've been using in the sample to capture the `beforeinstallevent`
    deferredPrompt.prompt();
    // Find out whether the user confirmed the installation or not
    const { outcome } = await deferredPrompt.userChoice;
    //const { outcome } = deferredPrompt.userChoice(true);
    // The deferredPrompt can only be used once.
    deferredPrompt = null;
    // Act on the user's choice
    if (outcome === 'accepted') {
    console.log('User accepted the install prompt.');
    } else if (outcome === 'dismissed') {
    console.log('User dismissed the install prompt');
    }
});


window.addEventListener('appinstalled', () => {
    installButton.style.display = "none";
});