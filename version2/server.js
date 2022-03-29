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

let photoPath;

const server = http.createServer(app);

app.set('view engine', 'ejs');

app.get('/', (req,res) =>{

    res.render('pages/index',
    data = {
        accountCreated : false,
        alreadyExist : false
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

let goToChat = (req, res, userDetailsObj) => {

    res.render('pages/chat', 
            
        data = {
            dataFromForm : req.body,
            userData : userDetailsObj
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

    photoPath = `uploads/unknown.png`;

    DB.getUser({username : req.body.username, password : req.body.password}) // Return a Promise
    .then(arr => { 
  
        if(arr.length !== 0){ // If user exists

            console.log(arr.length);
            console.log(arr[0]['user_id']); 

            DB.getUserStatus( arr[0]['user_id'] ) // Check user's status
            .then(ans => {

                console.log(ans[0]['status_name']);

                if(ans[0]['status_name'] === 'offline'){ // If user is exists in DB and offline

                    let status = 'online';

                    console.log(arr[0]['user_id'])

                    DB.updateUserStatusInDB( status, arr[0]['user_id'] ) // Update user's status
                    .catch(err => console.log(err));

                    goToChat(req, res, arr[0]); // 'arr[0]' holds obj with all user's data 

                }else{ // If user is already 'online'

                    res.render('pages/index',
                    data = {
                        accountCreated : false,
                        alreadyExist : true
                    })
                }
            })
            .catch(err => console.log(err));

        }else{ // If the user is not exists - Go to register page to registration

            goToRegister(false, res);
    
           }
    })
    .catch(err => console.log(err))
}


app.get('/index', (req, res) => { // When the user leaves the chat 

    console.log((JSON.parse((req.query)['username']))['username'])
    // Get user's ID from DB
    DB.getUser({username : (JSON.parse((req.query)['username']))['username']}) // Return a Promise
    .then(arr => { 

        // Update user's status to 'offline' in DB 
        DB.updateUserStatusInDB( "offline", arr[0]['user_id'] ) // Update user's status
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));

    res.render('pages/index',
                data = {
                        accountCreated : false,
                        alreadyExist : false
    })
})


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

            DB.insertNewUserToDB(req.body, photoPath) 
            .then(arr =>{

                let status = "offline"; // For new user

                console.log(arr[0]['user_id'])
                
                DB.insertUserStatusToDB( status, arr[0]['user_id'] ) // Update user's status
                .catch(err => console.log(err));
          
                res.render('pages/index',
                data = {
                        accountCreated : true,
                        alreadyExist : false
                    })
            })
            .catch(err => console.log(err));
        }
    })
    .catch(err => console.log(err));
}


app.post('/index', (req, res) => {

    checkRegistrationDetailsToStore(req, res); // If the user exists into db - details already exist
}) 

const fs = require('fs');
const multer = require('multer');

let storage = multer.diskStorage({

    destination : function (req, file, callback) {

        let dir = "./public/uploads";

        if(!fs.existsSync(dir)){

            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },

    filename : function(req, file, callback) {

        callback(null, file.originalname);

        photoPath = `uploads/${file.originalname}`;
    }
});

// Uploade just one file each time
let upload = multer({storage:storage}).array("files", 1);


app.post('/upload', (req, res) => {

    upload(req, res, function(err) {

        if(err){

            console.log("error to upload!")
        }
    })
})



server.listen(`${process.env.PORT || 4444}`,()=>{
    console.log(`Server listening on port ${process.env.PORT}`);
    
})