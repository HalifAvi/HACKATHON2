// const dotenv = require('dotenv');
// dotenv.config();
const socket = io('http://localhost:2000')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

// To ask for the user's name
const name = prompt('What is your name?')
appendMessage('You joined')
// 1. 'new-user' Event - Sending to server the name of the connected user
// To send it to others
socket.emit('new-user', name)

// 5.1 On event : 'chat-message' = when the server sends a message from other user
socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

// 2.1 'user-connected' Event - When receiving a message from server that someone connected
socket.on('user-connected', name => {
  appendMessage(`${name} connected`)
})

// 6. 'user-disconnected' Event 
socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

// 3. Each time the user presses the submit btt to send his message
messageForm.addEventListener('submit', e => {
  e.preventDefault()
  const message = messageInput.value
  appendMessage(`You: ${message}`)
  // 4. 'send-chat-message' Event - Sending the message from the client to the server
  socket.emit('send-chat-message', message)
  messageInput.value = ''
})

// For appending the message from server to each user html page
function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}