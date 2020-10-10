// const axios = require('axios')
// const { v4: uuidv4, stringify } = require('uuid');
// const bcrypt = require('bcryptjs');
// const { create } = require('json-server');

// const User = {
//     updatePassword: async (password) => {
//         console.log(User)
//         return new Promise( resolve =>{
//         //Regex for numbers, uppercase and lowercase letters
//         const REQUIRED_CHARACTERS = /[0-9]*[A-Z]*[a-z]/

//         //If the password isn't long enough or has no numbers or uppercase letters
//         if (password.length < 8 || !password.match(REQUIRED_CHARACTERS)) {
//             throw 'Invalid password. Must use at least 8 characters and have a number, uppercase, and lowercase letters';
//         } else {
//             User.password = {};
//             //Create the salt
//             bcrypt.genSalt().then((salt) =>{
//                 //Hash the value
//                 bcrypt.hash(password,salt).then((hash) => {
//                     //Store the values
//                     User.password.pass = hash;
//                     User.password.salt = salt;
//                     resolve(this);
//                 })
//             })
//         }});   
//     },
    
//     generateCookie: async (user, cookie) => {
//         return new Promise((resolve) =>{
//         user.cookie = {};
//         //Send the cookie to the front end
//         bcrypt.genSalt().then((salt) => {
//             user.cookie.salt = salt;
//             bcrypt.hash(cookie, salt).then((hash) => {
//                 user.cookie.pass = hash;
//                 resolve(user);
                
//             })
//         })})      
//     },

//     initialize: async (newEmail, newPassword) => {
        
//         //Prevent the Note from being sent too early by sending a promise.
//         return new Promise((resolve) =>{
//             //Set the email in plain text
//             User.email = newEmail;
            
//             //Set the keys as null to begin with
//             User.steamKey = null;
//             User.gogKey = null;
//             User.discordKey = null;

//             //Create an ID
//             User.id = uuidv4();
//             //Generate a login cookie. 
//             //NEEDS TO BE IMPROVED
//             User.generateCookie(User, 'Cookie');

//             //This is both the longest segment due to the salt + hash
//             //And the final function before finalizing the user info.
//             //Await wasn't working here, hence the resolve.
//             User.updatePassword(newPassword).then( () => {
//                 resolve(User);
//             });
//     })},
// }

// async function getUsers() {
//     return new Promise((resolve) => {
//         var user = axios.get('http://localHost:3001/profile/').then((user) => {
//             resolve(user.data);
//         })
//     })
// }

// async function updateCookie(user, cookie){
//     User.generateCookie(user, cookie).then((updated) =>{
    
//     axios.post('http://localHost:3001/profile', updated)
//         .then(console.log('cookie updated'))
//         .catch((e)=>{console.log(e)})
//     });  
// }

// function login(email, password){
    
//     //Get the users
//     getUsers().then((user) => {
    
//         //Once we attach the database, FIND THE RIGHT USER
//         if(user.email === email){
//             //Hash the attempted password with the same salt
//             bcrypt.hash(password, user.password.salt).then((hash) =>{
//                 if (user.password.pass === hash){
//                     console.log('logging in!');
//                     updateCookie(user, 'ngqpnerwpinpear');
//                 }
//                 else {
//                     console.log('Wrong password');
//                 }
//             })
//         }
//     });
// }

// function createAccount(email, password) {
//     //Create a new user object
//     var newUser = new Object(User);
//     console.log(newUser);
//     //Update its information
//     newUser.initialize(email, password)
//     .then(()=> {

//         //Put the new account into the server
//         axios.post('http://localHost:3001/profile', newUser)
//             .then(login(newUser.email, 'P4ssw0rd!'))
//             .catch('Cannot create a new account. Sorry!')
//         .catch((e)=>{console.log(e)});
//     });
// };

// createAccount('gj3842@wayne.edu', 'P4ssw0rd!');