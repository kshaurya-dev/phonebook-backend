const express = require('express')
require('dotenv').config()
const app = express()
const morgan = require("morgan")
app.use(express.json())
const cors = require("cors")
app.use(cors())
app.use(express.static('dist'))
app.use(morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens['response-time'](req, res) + ' ms',
      JSON.stringify(req.body)
    ].join(' ')
  }))
const Person = require('./models/person')
const mongoose = require('mongoose')
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons/', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id' , (request , response ,next)=>{
    Person.findById(request.params.id)
    .then(searchedPerson=>{
      if(searchedPerson) response.json(searchedPerson)
      else response.status(404).end()
    })
    .catch(error=>next(error))
})
app.get('/info' , (request , response)=>{
    Person.find({}).then(persons => {
      const date = new Date().toString()
      const data =`phonebook has info for ${persons.length} people`+"\n"+date
      response.type('text/plain').send(data)
    })
})
app.delete('/api/persons/:id' , (request , response , next )=>{
  Person.findByIdAndDelete(request.params.id)
  .then(result =>{
    if (!result) {
      // If no person was found and deleted, send 404
      return response.status(404).json({ error: 'Person not found' });
    }
    response.status(204).end()
  })
  .catch(error=>next(error))
})
const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => Number(p.id)))
      : 0
    return String(maxId + 1)
  }
app.post('/api/persons/' , (request, response , next)=>{
    const body = request.body
    if(!body){
        return response.status(400).json({error:"content missing"})}

    if(!body.number ){
        return response.status(400).json({error:"number missing"  })
    }
    /*const exists = persons.find(person => person.name===body.name)
    if(exists){
        return response.status(400).json({
            error:"name must be unique"  
        })
    }*/
    const person = new Person({
      name: body.name,
      number: body.number,
    })
    person.save().then(savedPerson =>{
      response.json(savedPerson)
    })
    .catch(error=>next(error))
})
/*when we send data via post to a express server  
, it is sent in the form of json and the json parser i used ,
converts it into a JS object and attaches it to the body property of the request object ?*/
app.put('/api/persons/:id', (request, response, next) => {
  const { name , number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }
      person.name = name
      person.number = number
      return person.save()
      .then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch(error => next(error))
})
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') return response.status(400).send({ error: 'malformatted id' })
  else if(error.name==='ValidationError')return response.status(404).send({ error: error.message })
  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})