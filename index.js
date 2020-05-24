const express = require('express')
const app = express()
const port = 5000

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://cherie:ryc1214@react-2020-coyar.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false,
}).then(() => console.log("mongDB Connected..."))
  .catch(err => console.log(err))



app.get('/', (req, res) => res.send('Hello World! '))

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))