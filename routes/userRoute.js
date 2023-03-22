const express = require('express')
const bodyParser = require('body-parser')
const user_route = express()
const session = require('express-session')
const config = require('../config/config')

user_route.use(session({
    secret:config.sessionSecret ,
    resave: false,
    saveUninitialized: true
}))

const auth = require('../middleware/auth')
const authadmin = require('../middleware/adminauth')

user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

user_route.set('view engine','ejs')
user_route.set('views',[
    './views/admin',
    './views/admin/users',
    'views'
])


const multer  = require('multer')
const path  = require('path')

user_route.use(express.static('public')) 

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userImages'),function(error,success){
            if(error)throw error
        })
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name,function(error1,success1){
            if(error1)throw error1
        })
    }
})

const upload = multer({storage:storage})

user_route.use(express.static('public'))


const admin_controller = require('../controllers/adminController')

user_route.get('/register',admin_controller.register)
user_route.get('/login',authadmin.isLogout,admin_controller.login)
user_route.get('/admin/dashboard',authadmin.isLogin,admin_controller.dashboard)
user_route.get('/users/add',admin_controller.insertdata)
user_route.get('/forget',authadmin.isLogout,admin_controller.forgetload)
// user_route.get('/forget-password',authadmin.isLogout,admin_controller.forgetpassword)
user_route.get('/verify',admin_controller.verifymail)
user_route.get('/users/list',admin_controller.allusers)
user_route.get('/profile',authadmin.isLogin,admin_controller.Profile)
user_route.get('/logout',authadmin.isLogin,admin_controller.logout)
// user_route.get('*', function(req,res){
//     res.redirect('/login')
//   })



module.exports = user_route