const express = require('express')
const app = express()

const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/apidemo')

const user_route = require('./routes/userRoute')
const admin_route = require('./routes/adminRoute')
app.use('/',user_route)  
app.use('/admin',user_route)  
app.use('/api',admin_route)
  
app.listen(4000,function(){
    console.log(4000,'server is ready')
})