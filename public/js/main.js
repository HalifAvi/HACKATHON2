let setBackgroundImg = () => {

    let chatBackgroundElement = document.querySelector('main.chat-main');

    console.log(chatBackgroundElement)

switch(room){ 

    case 'LifeStyle' : chatBackgroundElement.style.backgroundImage = "url('img/LifeStyle.jpg')";
        break;  

    case 'Sport' : chatBackgroundElement.style.backgroundImage = "url('img/Sport.jpg')";
        break;

    case 'Technology' : chatBackgroundElement.style.backgroundImage = "url('img/Technology.jpg')";
        break;

    case 'RealEstate' : chatBackgroundElement.style.backgroundImage = "url('img/RealEstate.jpg')";
        break;

    case 'Games' : chatBackgroundElement.style.backgroundImage = "url('img/Games.jpg')";
        break;

    case 'Cooking' : chatBackgroundElement.style.backgroundImage = "url('img/Cooking.jpg')";
        break;
    }
}


const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//** Get Username and Room from URL */ 

let jsonDataFromForm = document.querySelector('div.chat-messages').id;
let objDataFromForm = (JSON.parse(jsonDataFromForm)).dataFromForm;

console.log(jsonDataFromForm)
const {username, room} = objDataFromForm;    

setBackgroundImg();

const socket = io(); // corresponds to io.on on server.js

//** Join user to chat room */
socket.emit('joinRoom', {username, room});

//** Get room & users info from server */
socket.on('roomUsers', ({room, users})=> {
    outputRoomName(room);
    outputUsers(users);
})

socket.on('message', message => { // catching message from socket.emit on server.js
    console.log(message);
    outputMessage(message); // Message from server
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll to new message
})

//** To Send A Message */
chatForm.addEventListener('submit', e => {
    e.preventDefault();
    // Grab message text
    const msg = e.target.elements.msg.value;
    // console.log(msg);
    // Send message to server
    socket.emit('chatMessage',msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//** Append Message To DOM */
const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
};

//** Room Name To Sidebar */
const outputRoomName = (room) => {
    roomName.innerText = room;
};

//** Users To Sidebar */
const outputUsers = (users) => {
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
};


