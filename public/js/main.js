const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');


//** Get Username and Room from URL */ 

let jsonDataFromForm = document.querySelector('div.chat-messages').id;
let objDataFromForm = JSON.parse(jsonDataFromForm)
const {username, room} = objDataFromForm;

const socket = io(); // corresponds to io.on on server.js

//** Join user to chat room */
socket.emit('joinRoom', {username, room});

//** Get room & users info from server */
socket.on('roomUsers', ({room, users})=> {
    outputRoomName(room);
    outputUsers(users);
    roomBackground(room);
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

const roomBackground = (room) => {
    if(room) {
        chatMessages.style.backgroundImage = "url('https://media.istockphoto.com/vectors/customer-support-related-seamless-pattern-and-background-with-line-vector-id1201667381')"
    } else {
        console.log('nope');
    }
}
   
