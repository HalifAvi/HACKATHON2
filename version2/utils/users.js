//** THIS COULD BE OUR DATA BASE **//

const users = [];

// Join user to chat
function userJoin(id, username, room){
    const user = {id, username, room};
    users.push(user);
    return user;
}

// Get current user
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

// User Leaves chat
function userLeft(id){
    const i = users.findIndex(user => user.id === id);
    if (i !== -1){
        return users.splice(i, 1)[0];
    }
}

// Get user of room
function roomUsers(room){
    return users.filter(user => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeft,
    roomUsers
};