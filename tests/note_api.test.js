const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Note = require('../models/note')

const initialNotes = [
    {
        content: 'HTML is Eezy',
        important: false,
        date: new Date()
    },
    {
        content: 'This is where we stand',
        important: true,
        date: new Date()
    }
]

beforeEach(async () => {
    await Note.deleteMany({})

    let noteObject = new Note(initialNotes[0])
    await noteObject.save()

    noteObject = new Note(initialNotes[1])
    await noteObject.save()
})

test('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
    const response = await api.get('/api/notes')

    expect(response.body.length).toBe(initialNotes.length)
})

test('a specific note is within returned notes', async () => {
    const response = await api.get('/api/notes')

    const contents = response.body.map(r => r.content)

    expect(contents).toContain(
        'This is where we stand'
    )
})

afterAll((done) => {
    mongoose.connection.close()
    done()
})