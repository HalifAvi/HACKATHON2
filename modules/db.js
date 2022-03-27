const knex = require('knex');
const dotenv = require('dotenv');

dotenv.config();

const db = knex({

    client: 'pg',
    connection:{

        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    }
});


/*
*
* This function get the user's details from db (returns a Promise)
*/
const getUser = (obj) => {

    let condition;

    // Check if we just want to know if we already have the same username in db
    // Or we want to know thw username + password are correct to login 
    obj.hasOwnProperty('password') ? condition = {username : obj.username, password : obj.password} :
                                     condition = {username : obj.username}       

    return db('Hackaton2')
    .select('*')
    .from('users')
    .where(condition)
} 


/*
*
* This function insert new user to the db
*/
const insertNewUserToDB = (obj) => {

    db('Hackaton2')
   .insert([{user_name : obj.firstName, user_last_name : obj.lastName, age : obj.age, e_mail : obj.email, password : obj.password, username : obj.username}])
   .from('users')
   .catch(e => console.log(e))
}


/*
*
* This function insert new user status to the db
*/
// const insertUserStatusToDB = (status, userID) => {

//     status = "offline"; // For new user

//     db('Hackaton2')
//    .insert([{status_name : status, }])
//    .from('usersStatus')
//    .catch(e => console.log(e))
// }


module.exports = {

    getUser, 
    insertNewUserToDB,
    // insertUserStatusToDB
}





