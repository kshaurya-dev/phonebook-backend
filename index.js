const express = require('express')
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
let persons = [
    {
      "id": 1,
      "name": "sekiro yadav",
      "number": "9999999"
    },
    {
      "id": 2,
      "name": "batman singh chaturvedi",
      "number": "00000"
    },
    {
      "id": 3,
      "name": "guts thakur",
      "number": "111"
    },
    {
      "id": 4,
      "name": "Bond , Jatin Bond",
      "number": "707"
    }
  ]

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/api/persons/:id' , (request , response)=>{
    const id  = request.params.id
    const person = persons.find(person=>person.id===id)
    if(person) response.json(person)
    else response.status(404).end()
})
app.get('/info' , (request , response)=>{
    const date = new Date().toString()
    const data =`phonebook has info for ${persons.length} people`+"\n"+date
    console.log(data)
    response.type('text/plain').send(data)
})
app.delete('/api/persons/:id' , (request , response )=>{
    const id = request.params.id
    persons = persons.filter(person => person.id != id)
    response.status(204).end()
})
const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => Number(p.id)))
      : 0
    return String(maxId + 1)
  }
app.post('/api/persons/' , (request, response)=>{
    const body = request.body
    if(!body){
        return response.status(400).json({
            error:"content missing"  
        })
    }
    if(!body.number ){
        return response.status(400).json({
            error:"number missing"  
        })
    }
    const exists = persons.find(person => person.name===body.name)
    if(exists){
        return response.status(400).json({
            error:"name must be unique"  
        })
    }
    const newPerson = {
        name: body.name,
        number: body.number ,
        id: generateId(),
      }
    persons=persons.concat(newPerson)
    response.json(newPerson)
})
/*when we send data via post to a express server  
, it is sent in the form of json and the json parser i used ,
converts it into a JS object and attaches it to the body property of the request object ?*/ 
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})