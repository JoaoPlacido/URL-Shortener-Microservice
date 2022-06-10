//set express
const express = require('express')
const app = express()

//set env
require('dotenv').config()
console.log(process.env.MONGO_URI)

//set dns
const dns = require('dns')

//set body-parse
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//set cors
const cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 }))

app.use(express.static('public'))

//load index.html

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//Regular expression to http string format
const httpFormat = new RegExp('https*://w+.')
const httpIni = new RegExp('https*://')

app.post('/api/shorturl', (req, res) => {
  console.log(req.body['url'])

  //check if the user url is in corret format
  if (httpFormat.test(req.body['url'])) {
    //look if is a true website
    dns.lookup(req.body['url'].replace(httpIni, ''), (err, addresses) => {
      if (err) {
        res.json({ error: 'Invalid Hostname' })
      } else {
        res.json({
          original_url: req.body['url']
        })
      }
    })
  } else {
    //url in wrong format
    res.json({ error: 'invalid url' })
  }
})

//deff listerner
var listener = app.listen(3000, () => {
  console.log('Listening on port ' + listener.address().port)
})
