const express = require('express');
const app = express();
const http = require('http');
const dotenv = require('dotenv');
const DB = require('./modules/db.js');
dotenv.config();
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const usersFunc = require('./utils/users');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const botName = 'HOST';

const server = http.createServer(app);


app.set('view engine', 'ejs');

app.get('/', (req,res) =>{

    res.render('pages/index',
    {
        accountCreated : false
    })
})

app.use('/',express.static('public'));

const io = socketio(server);

//** When a User Connects **/
io.on('connection', socket => {
    //** handle user Join from client side */
    socket.on('joinRoom', ({username, room}) => { 
        const user = usersFunc.userJoin(socket.id, username, room);

        socket.join(user.room);

        //** Welcome User */
        socket.emit('message', formatMessage.formatMessage(botName, 'Welcome To the Chat Room!')) // .emit BROADCASTS to a single connected client on client side
        //** When Someone Joins */
        socket.broadcast.to(user.room).emit('message',formatMessage.formatMessage(botName, `${user.username} just joined the chat`)); // .broadcast.emit BROADCASTS to all clients on clients side ECXEPT for the user that just connected
        
        //** Users & room info to sidebar */
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: usersFunc.roomUsers(user.room)
        });
    });
    
    //** Catch messages from client side */
    socket.on('chatMessage', (msg)=> {
        const user = usersFunc.getCurrentUser(socket.id);
        //** Send the message back to chat room */
        io.to(user.room).emit('message',formatMessage.formatMessage(user.username, msg));
    });
    //** When Someone Leaves */
    socket.on('disconnect', () => {
        const user = usersFunc.userLeft(socket.id);
        if(user){
            io.to(user.room).emit('message', formatMessage.formatMessage(botName, `${user.username} just left the chat`)) // will BROADCAST to ALL connected clients on client side
             //** Users & room info to sidebar */
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: usersFunc.roomUsers(user.room)
             });
        }
        
    });
}); 

let goToChat = (req, res) => {

    res.render('pages/chat', 
            
        {
            dataFromForm : req.body
        }
    )   
}


let goToRegister = (boolVar, res) => {

    res.render('pages/register', 
    
        data = {  

        isUserAlreadyExist : boolVar
        }
    )
}


let checkLogIn = (req, res) => {

    DB.getUser({username : req.body.username, password : req.body.password}) // Return a Promise
    .then(answer => { 

        console.log(answer.length)

        if(answer.length !== 0){ // If user exists

            goToChat(req, res);
            
        }else{ // Go to register page to registration

            goToRegister(false, res);
    
           }
    })
    .catch(err => console.log(err))
}


app.post('/chat', (req, res) => {

    checkLogIn(req, res); // If the user exists into db - go to chat!
})


let checkRegistrationDetailsToStore = (req, res) => {

    DB.getUser({username : req.body.username}) // Return a Promise
    .then(answer => {  // The answer is an array of objects

        console.log(answer.length)

        if(answer.length !== 0){ // If user exists

            goToRegister(true, res);
            
        }else{ // Insert the new user details to db and go to login page

            DB.insertNewUserToDB(req.body)
                // .then(answer => {
                // console.log(answer);


                res.render('pages/index',
                {
                    accountCreated : true
                })
            // })
            // .catch(e => console.log(e))
        }
    })
    .catch(err => console.log(err));
}



app.post('/index', (req, res) => {

    checkRegistrationDetailsToStore(req, res); // If the user exists into db - details already exist
}) 



server.listen(`${process.env.PORT || 4444}`,()=>{
    console.log(`Server listening on port ${process.env.PORT}`);
    
})