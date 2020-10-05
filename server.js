// The entry point to the backend

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path')
require('./database');

const app = express();

app.use(bodyParser.json())
app.use(cors());
app.use(express.json())

// API
const user = rquire('/api/users')

app.use('/api/users', users)
app.use(express.static(path.join(__dirname, '../build')))

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build'))
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// old stuff

let notes = [
    {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
    },
    {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
    },
    {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
    }
]

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/api/notes/:id', (request, response) => {
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