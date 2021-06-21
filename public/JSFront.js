//svar socket = io.connect('http://localhost:3000');




//controle systematique du pseudo
while(!pseudo) {
    var pseudo = prompt('quel est ton nom ?');
}

var socket = io.connect('http://localhost:3000');

socket.emit('pseudo', pseudo);

document.title = pseudo + ' - ' + document.title;


document.getElementById('ReceveurMSG').addEventListener('submit', (e)=>{


    //on evite le rechargement de page
    e.preventDefault();

    // Il faut effacer l'ancien message
    const textInput = document.getElementById('msgInput').value;
    document.getElementById('msgInput').value = '';

    // On récupère le destinataire du message
    const receiver = document.getElementById('receiverInput').value;


    // On récupère le destinataire du message
    //const destinataire = document.getElementById('receiverInput').value;

    // Si la valeur > 0, on envoie un message au serveur contenant la valeur de l'input 
    if(textInput.length > 0) {

        socket.emit('newMessage', textInput, receiver);
        if(receiver === "all") {
            createElementFunction('newMessageMe', textInput);
        }

    } else {
        return false;
    }

});


socket.on('newUser', (pseudo) => {
    createElementFunction('newUser', pseudo);
});

socket.on('newMessageAll', (content) => {
    createElementFunction('newMessageAll', content);
});
socket.on('whisper', (content) => {
    createElementFunction('whisper', content);
});

// Une personne est en train d'ecrire
socket.on('writting', (pseudo) => {
    document.getElementById('isWritting').textContent = pseudo + ' est en train d\'écrire';
});
// Elle a arrêté d'ecrire
 socket.on('notWritting', () => {
    document.getElementById('isWritting').textContent = '';
});

socket.on('quitUser', (pseudo) => {
    createElementFunction('quitUser', pseudo);
});



// S'il ecrit on emet 'writting' au serveur
function writting() {
    socket.emit('writting', pseudo);
}

// S'il ecrit plus on emet 'notWritting' au serveur
function notWritting() {
    socket.emit('notWritting');
}





function createElementFunction(element, content) {
    
    const newElement = document.createElement("div");

    switch(element){

        case 'newMessageMe':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = pseudo + ': ' + content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;
            
            
        case 'newMessageAll':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.pseudo + ': ' + content.message;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'whisper':
            newElement.classList.add(element, 'message');
            newElement.textContent = content.sender + ' vous dit en mp : ' + content.message;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'newUser':
            newElement.classList.add(element, 'message');
            newElement.textContent = content + ' est arrivé sur le chat';
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'quitUser':
            newElement.classList.add(element, 'pseudo');
            newElement.textContent = content + ' est parti';
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessages':
            newElement.classList.add(element, 'message');
            newElement.innerHTML = content.sender + ': ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

        case 'oldMessagesMe':
            newElement.classList.add('newMessageMe', 'message');
            newElement.innerHTML = content.sender + ': ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
        break;

        case 'oldWhispers':
            newElement.classList.add(element, 'message');
            newElement.textContent = content.sender + ' vous chuchote: ' + content.content;
            document.getElementById('msgContainer').appendChild(newElement);
            break;

    }
}