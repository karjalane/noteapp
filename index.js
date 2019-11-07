const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')

const Note = require('./models/note')

app.use(bodyParser.json())
const cors = require('cors')
app.use(cors())

const requestLogger = (req, res, next) => {
    console.log('Method:', req.method)
    console.log('Path:  ', req.path)
    console.log('Body:  ', req.body)
    console.log('---------')
    next()
}

app.use(requestLogger)

/*
let notes = [
    {
        id: 1,
        content: 'HTML is easy',
        date: '2019-05-30T17:30:31.098Z',
        important: true
    },
    {
        id: 2,
        content: 'Browser can execute only JavaScript',
        date: '2019-05-30T18:39:34.091Z',
        important: false
    },
    {
        id: 3,
        content: 'GET and POST are the most important methods of HTTP protocol',
        date: '2019-05-30T19:20:14.298Z',
        important: true
    }
]
*/

app.use(express.static('build'))

app.get('/', (req, res) => {
    res.send('<h1>Hello Wörld!</h1>')
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    note
        .save()
        .then(savedNote => savedNote.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        })
        .catch(error => next(error))
})

app.get('/api/notes', (req, res) => {
    Note.find({}).then(notes => {
        res.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id)
    .then(note => {
        if (note) {
            response.json(note.toJSON())
        } else {
            response.status(204).end()
        }
    })
    .catch(error => next(error))
})

app.delete('/api/notes/:id', (request, response, next) => {
    Note.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body

    const note = {
        content: body.content,
        important: body.important
    }
    
    Note.findByIdAndUpdate(request.params.id, note, { new: true })
        .then(updatedNote => {
            response.json(updatedNote.toJSON())
        })
        .catch(error => next(error))
})

/*const generateID = () => {
    const maxID = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxID + 1
}*/

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'Unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.error(error.message)

    if (error.name === 'CastError' && error.kind == 'ObjectId') {
        return res.status(400).send({ error: 'Malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})