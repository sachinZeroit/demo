const express = require('express')
const admin_route = express()
const session = require('express-session')
const config = require('../config/config')
admin_route.use(session({
    secret:config.sessionSecret ,
    resave: false,
    saveUninitialized: true
}))

const bodyParser = require('body-parser')
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:true}))
   
admin_route.set('view engine','ejs') 
admin_route.set('views',[
    './views/admin',
    './views/admin/users',
    'views'
])

const multer  = require('multer')
const path  = require('path')

admin_route.use(express.static('public')) 

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

const auth = require('../middleware/auth')
const authadmin = require('../middleware/adminauth')
const admin_controller = require('../controllers/adminController')

admin_route.get('/list',admin_controller.userall)     

admin_route.post('/login',admin_controller.login_user)  
admin_route.post('/register',upload.single('image'),admin_controller.register_user)
admin_route.get('/edit/:id',admin_controller.edituser)
admin_route.post('/update/:id',upload.single('image'),admin_controller.updateUserlist)
admin_route.post('/insert',upload.single('image'),admin_controller.insert_data)
admin_route.get('/delete/:id',admin_controller.delete_user)

admin_route.get('/profile',authadmin.isLogin,admin_controller.userProfile)
admin_route.post('/profile',admin_controller.user_Profile)

admin_route.get('/test',auth,function(req,res){
    res.status(200).send({success:true,msg:"sauthenticated"})
})

admin_route.post('/forget',admin_controller.forgetverify)
 
admin_route.post('/forget-password',admin_controller.forget_password)


module.exports = admin_route