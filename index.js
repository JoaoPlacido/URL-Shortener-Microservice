//set express
const express = require('express')
const app = express()

//set cors
const cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 }))

app.use(express.static('public'))

//load index.html

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//deff listerner
var listener = app.listen(3000, () => {
  console.log('Listening on port ' + listener.address().port)
})
