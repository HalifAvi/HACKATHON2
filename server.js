// const dotenv = require('dotenv');
// dotenv.config();
const express = require('express');
const app = express();

app.listen(2020,()=>{
    console.log('Listening on port 2020');
})

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('/')
});

const io = require('socket.io')('2000');

const users = {}

// Each time a user loads up the website we call this function
// Each one gets his own socket
io.on('connection', socket => {

  // 1.1 'new-user' EVENT - When getting an event that new user signed up
  socket.on('new-user', name => {
    users[socket.id] = name
    // 2. 'user-connected' EVENT - Sending a message to all conected users about who connected
    socket.broadcast.emit('user-connected', name)
  })

  // 4.1 'send-chat-message' EVENT - When one user want to send message to others
  socket.on('send-chat-message', message => {
    // 5. 'chat-message' EVENT - Sending the message from one user to every connected user to server
    // Except to the user who sends the message
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })

  // 6.1 'user-disconnected' Event 
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})