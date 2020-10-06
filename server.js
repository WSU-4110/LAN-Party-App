////////////////////////////////////////////////////
//** This the entry point to the entire backend **//
////////////////////////////////////////////////////

// Grabbing our enviroment variables from the .env file
require('dotenv').config()

// Importing our npm packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cors = require('cors');

// Starting our app
const app = express();

// This is our Express port
const port = process.env.PORT || 5000;

// Importing our modules
const User = require('./models/user')

app.use(cors());
app.use(bodyParser.json())
app.use(express.json())
//app.use('/api/users', users)

//////////////////////////////////////////////////////////////////
//** Database Functions *//
//////////////////////////////////////////////////////////////////

// Finding a user
app.get('/api/users', (request, response) => {
    User.find({}).then(users => {
      response.json(users.map(user => user.toJSON()))
    })
})

// Adding a user
app.post('/api/users', (request, response) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({ error: 'content missing' })
    }
  
    const user = new User({
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        password: body.password
    })
    
    user.save().then(savedUser => {
        response.json(savedUser.toJSON())
    })
})

// Delete a user by their email
app.delete('/api/users/:email', (request, response) => {
    const email = request.params.email
    users = users.filter(user => user.email !== email)
  
    response.status(204).end()
})

// Listening
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

