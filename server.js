const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
var mongoose = require('mongoose');

//Un ObjectId est un type spécial généralement utilisé pour les
// identifiants uniques.
// Voici comment déclarer un schéma avec un chemin driverqui est un ObjectId
//On fonctionne avec des id uniques a 24 caracteres
const ObjectId = mongoose.Types.ObjectId;
var connectedUsers = []

// je me connecte à ma base de données DBADAM et évite les erreurs la doc dit d'inclure ces parametres https://mongoosejs.com/docs/deprecations.html
mongoose.connect('mongodb://localhost/DBADAM', { useNewUrlParser: true, useUnifiedTopology: true }, function(err){
if(err) {
    console.log(err)
} else {
    console.log('Je suis connecté à ADAMDB')
}
})

//On doit importer les modeles pour que l
require('./models/profil.model');
require('./models/historique.model');
//Je stocke les modeles qui sont renvoyés par mongoose à partir des 
//fichiers profil et historique dans dossier models
var profil = mongoose.model('profil');
var historique = mongoose.model('historique');



//On utilise une vue qui restitue notre fichier ejs 
app.get('/', (req, res) => {
    profil.find((err, profils) => {
         res.render('index.ejs', {profils: profils});      
    });
});

//On signife qu'on utilise les fichiers statiques qui seront dans public
app.use(express.static(__dirname + '/public'));

/* //404
app.use(function(req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.status(404).send('Page introuvable !');
});
 */

io.on('connection', (socket) => {

    socket.on('pseudo', (pseudo) => {

        profil.findOne({ pseudo: pseudo }, (err, user) => {
            
           
        if (user) {
        socket.pseudo = pseudo;
        socket.broadcast.emit('newUser', pseudo);
        }else {
            var user = new profil();
            user.pseudo = pseudo;
            user.save();
            socket.pseudo = pseudo;
        socket.broadcast.emit('newUser', pseudo);
        }

        //on met la socket sous forme d'objet dans le tableau
        connectedUsers.push(socket);
        historique.find((err, messages) => {
            socket.emit('oldMessages', messages)

        });
    });
    });

    socket.on('newMessage', (message,receiver)=> {
        if (receiver === "all") {
        var histosms = new historique();
        histosms.content = message;
        histosms.sender = socket.pseudo;
        histosms.receiver = receiver;
        histosms.save();
        socket.broadcast.emit('newMessageAll', {message: message, pseudo: socket.pseudo});  
        }else{

            profil.findOne({ pseudo : receiver},(err,profil) => {

                if (!profil) {
                    return false;
                }else {

            socketduReceiver = connectedUsers.find(socket => socket.pseudo === receiver);

            if (socketduReceiver) {
                socketduReceiver.emit('whisper', { sender: socket.pseudo, message: message});
            }

            var histosms = new historique();
            histosms.content = message;
            histosms.sender = socket.pseudo;
            histosms.receiver = "all";
            histosms.save();
        }
        });
        }
        
    })

    socket.on("oldMessages",(messages) => {
        messages.forEach(message => {
            if (message.sender === pseudo) {
                createElementFunction('oldMessagesMe',message)
            } else {
               createElementFunction('oldMessages', message) 
            }
        });
    })

    socket.on('disconnect', () => {
        //on trouve la socket de l'utilisateur qui se deonnecte
        var index = connectedUsers.indexOf(socket);
        //si la socket existe on supprime la socket de l'utilisateur
        if (index > -1) {
            connectedUsers.splice(index, 1);
        }
        socket.broadcast.emit('quitUser', socket.pseudo);
    });

    socket.on('writting', (pseudo) => {
        socket.broadcast.emit('writting',pseudo);
    });

    socket.on('notWritting', (pseudo) => {
        socket.broadcast.emit('notWritting', pseudo);
    });


});


server.listen(3000, () => {
  console.log('listening on *:3000');
});