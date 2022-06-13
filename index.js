//set express
const express = require('express')
const app = express()

//set env
require('dotenv').config()

//set dns
const dns = require('dns')

//set body-parse
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//set cors
const cors = require('cors')
app.use(cors({ optionsSuccessStatus: 200 }))

//setup  the DB
const mongoose = require('mongoose')
const { json } = require('body-parser')
mongoose.connect(process.env.MONGO_URI)

//def a schema for shortUrl
const Schema = mongoose.Schema

const shortURLSchema = new Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true }
})

const shortURL = mongoose.model('ShortURL', shortURLSchema)

var findMaxShortValue = done => {
  shortURL
    .findOne()
    .sort({ short_url: -1 })
    .limit(1)
    .exec((err, data) => {
      if (err) return console.log('erro')
      done(null, data)
    })
}

const findByOriginalURL = (OriginalUrl, done) => {
  shortURL.findOne({ original_url: OriginalUrl }, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const findByShortURL = (short, done) => {
  shortURL.findOne({ short_url: short }, (err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

const createAndSaveShortURL = (Url, short, done) => {
  var sUrl = new shortURL({
    original_url: Url,
    short_url: short
  })
  sUrl.save((err, data) => {
    if (err) return console.log(err)
    done(null, data)
  })
}

app.use(express.static('public'))

//load index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

//Regular expression to http string format
const httpFormat = new RegExp('https*://w+.')
const httpIni = new RegExp('https*://')

app.post('/api/shorturl', (req, res, next) => {
  console.log(req.body['url'])

  //check if the user url is in corret format
  if (httpFormat.test(req.body['url'])) {
    //look if is a true website

    dns.lookup(req.body['url'].replace(httpIni, ''), (err, addresses) => {
      //if website do not exist or not find
      if (err) {
        res.json({ error: 'Invalid Hostname' })
      } else {
        //search the url in DataBase
        findByOriginalURL(req.body['url'], (err, data) => {
          if (err) return next(err)
          //if do not exist in DB
          if (!data) {
            //search the max value of Short URL
            findMaxShortValue((err, data) => {
              if (err) return next(err)
              //save new SortURL
              console.log(data.short_url)
              createAndSaveShortURL(
                req.body['url'],
                data.short_url + 1,
                (err, data) => {
                  if (err) return next(err)
                  res.json({
                    original_url: data.original_url,
                    short_url: data.short_url
                  })
                }
              )
            })
          } else {
            //case This URL exist in DB
            res.json({
              original_url: data.original_url,
              short_url: data.short_url
            })
          }
        })
      }
    })
  } else {
    //url in wrong format
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short', (req, res, next) => {
  findByShortURL(parseInt(req.params.short), (err, data) => {
    if (err) return next(err)
    if (!data) {
      res.json({ erro: 'No short URL found for the given input' })
    } else {
      res.redirect(data.original_url)
    }
  })
})

//deff listerner
var listener = app.listen(3000, () => {
  console.log('Listening on port ' + listener.address().port)
})
