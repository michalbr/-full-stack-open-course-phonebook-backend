require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Contact = require('./models/contact')

app.use(express.json())
morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('dist'))

let persons = [
    { 
        "id": "1",
        "name": "Arto Hellas", 
        "number": "040-123456"
    },
    { 
        "id": "2",
        "name": "Ada Lovelace", 
        "number": "39-44-5323523"
    },
    { 
        "id": "3",
        "name": "Dan Abramov", 
        "number": "12-43-234345"
    },
    { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
    }
]

app.get('/info', (request, response) => {
  const requestDate = new Date()
  Contact.find({}).then(contacts => {
    const info = `<p>Phonebook has info for ${contacts.length} people.</p>` +
      `<p>${requestDate}</p>`
    response.send(info)
  })
})

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(result => {
    response.json(result)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findById(id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id

  Contact.findByIdAndDelete(id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons/', (request, response) => {
  const body = request.body

//   if (!body.number) {
//     return response.status(400).json({
//       error: 'number is missing'
//     })
//   }
//   if (!body.name) {
//     return response.status(400).json({
//       error: 'name is missing'
//     })
//   }
    // } else if (persons.map(person => person.name).includes(body.name)) {
  //   return response.status(400).json({
  //     error: 'name must be unique'
  //   })


  const newEntry = new Contact({
    name: body.name,
    number: body.number,
  })

  newEntry.save()
    .then(result => {
      response.json(result)
    })
    .catch(error => {
      console.log('There was an error in DB')
      response.status(400).send(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        const { number } = request.body
        contact.number = number
        contact.save().then(updatedContact => {
          response.json(updatedContact)
        })
        .catch(error => next(error))
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT =  process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})