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

io.on('connection', socket => {
  socket.on('new-user', name => {
    users[socket.id] = name
    socket.broadcast.emit('user-connected', name)
  })
  socket.on('send-chat-message', message => {
    socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    delete users[socket.id]
  })
})