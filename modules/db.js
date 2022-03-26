const knex = require('knex');
const dotenv = require('dotenv');
const { password } = require('pg/lib/defaults');

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
*This function get the all users + id
*/
const getUsers = () => {
    return  db('users')
    .select('user_id', 'user_name', 'user_lastname', 'username');
} 

/*
*
*This function get the all users id & passwords
*/
const getPassword = () => {
    return  db('users')
    .select('user_id', 'password')
} 


const validateUser = (username, password) => {    
    return  db('users')
    .select('username', 'password')
    .where({username : username},{password: password})
} 

module.exports = {
    getUsers,
    getPassword,
    validateUser
}