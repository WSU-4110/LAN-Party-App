//** This the entry point to the entire backend **//

// Importing our npm packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Starting our app
const app = express();

// This is our Express port
const port = process.env.PORT || 5000;

// Importing our modules
const User = require('./models/note')

//
app.use(cors());
app.use(express.json())
app.use('/api/users', users)

//** Connecting to our MongoDB on AWS **//
const url = process.env.MONGODB_URI

console.log('connecting to', url)

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })





if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://logan:${password}@cluster0.pgumn.mongodb.net/test?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.log(err))

app.get('/api/users', (request, response) => {
    User.find({}).then(users => {
        response.json(users)
    })
})

// const note = new Note({
//   content: 'HTML is Easy',
//   date: new Date(),
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })




































app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/users/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = notes.find(note => note.id === id)

    if(note) {
        response.json(note)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)

    response.status(204).end()
})

app.post('/api/notes', (request, response) => {
    const note = request.body
    console.log(note)

    response.json(note)
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes)
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});