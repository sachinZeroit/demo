const User  = require('../models/userModel')
const bcryptjs = require('bcryptjs')
const config = require('../config/config')
const jwt = require('jsonwebtoken')
const authadmin = require('../middleware/adminauth')

const nodemailer = require('nodemailer')
const randomstring = require('randomstring')

// const { getMaxListeners } = require('../models/userModel')
const sendResetPasswordMail = async(name,email,token)=>{
    try {
        
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:config.emailUser,
                pass:config.emailpassword
            }
        })

        const mailOptions = {
            from:config.emailUser,
            to:email,
            subject:'For Reset Password',
            html:'<p>Hii '+name+',PLease copy the link <a href="http://localhost:4000/forget-password?token='+token+'"> and reset your password</a>'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if (error) {
                // console.log(error)
            } else {
                // console.log("Mail has been sent:- info.response")
            }
        })
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}
const verificationMail = async(name,email,user_id)=>{
    try {
        const transporter = nodemailer.createTransport({
            host:'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth:{
                user:'sc7618370@gmail.com',
                pass:'nxolmqoyvcsrgdrm'
            }
        })

        const mailOptions = {
            from:'sc7618370@gmail.com',
            to:email,
            subject:'For verify mail',
            html:'<p>Hii '+name+',Please click to here to <a href="http://localhost:4000/verify?id='+user_id+'"> verify </a>your password'
        }
        transporter.sendMail(mailOptions,function(error,info){
            if (error) {
                // console.log(error)
            } else {
                // console.log("Mail has been sent:- info.response")
            }
        })
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const verifymail = async(req,res)=>{
    try {
        const updateinfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1 }})

        // console.log(updateinfo)
        res.render('email-verification')
    } catch (error) {
        // console.log(error.message)
    }
}

/**
 * Token method.............
*/
const create_token = async(id) =>{
    try {
        const token = await jwt.sign({ _id:id },config.config.secret_jwt)
        return token
    } catch (error) {
         res.status(400).send(error.message)
    }
}

const securePassword = async(password)=>{
    try {
        const passwordHash = await bcryptjs.hash(password,10)
        return passwordHash
    } catch (error) {
        res.status(400).send(error.message)
    }
}

const register = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        // console.log(error.message)
    } 
}

/*
* Register Method
*/
const register_user = async(req,res)=>{
    try {
        const spassword = await securePassword(req.body.password)

        const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            image:req.file.filename,
            mobile:req.body.mobile,
            is_admin:0
        })
       
        const userData = await User.findOne({email:req.body.email})
        if (userData) {
            res.status(200).send({success:false,msg:"this email is already exist"})
        } else {
            const userData = await user.save()
            verificationMail(req.body.name,req.body.email,userData._id)
            res.status(200).send({success:true,message:"your registration has been successfully please verify email"})
        }

    } catch (error) {
        res.status(400).send(error.message)
    }
}

const login = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        // console.log(error.message)
    } 
}

/*
* Login Method  
*/
const login_user = async(req,res)=>{
    try {
        const email = req.body.email
       
        const password = req.body.password
 
        const userData = await User.findOne({email:email})
        // console.log(userData)
        
        if (userData) {
            const passwordMatch = await bcryptjs.compare(password,userData.password)
            if (passwordMatch) {
                const tokenData = await create_token(userData._id)
            //    console.log(tokenData,"131234")
                const userResult = {
                    _id:userData._id,
                    name:userData.name,
                    email:userData.email,
                    password:userData.password,
                    image:userData.image,
                    mobile:userData.mobile,
                    token:tokenData
                }
               
                const response = {
                    success:true,
                    data:userResult
                }
                req.session.user_id = userData._id
                res.status(200).send(response)
                
            } else {
                res.status(200).send({message:false,msg:'password does not exist '})
            }
        } else {
            res.status(200).send({success:false,msg:'email does not exist'})
            
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
}

// logout...
const logout = async(req,res)=>{
    try {
        req.session.destroy()
        res.redirect('login')
    } catch (error) {
        // console.log(error.message)
    }
}

const dashboard = async(req,res)=>{
    try {
        res.render('dashboard')
    } catch (error) {
        // console.log(error.message)
    }
}

const forgetload = async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        // console.log(error.message)
    }
}

const forgetverify = async(req,res)=>{
    try {
        const email = req.body.email
        const userData  = await User.findOne({email:email})
        if (userData) {
            const randormstring = randomstring.generate()
            const data = await User.updateOne({email:email},{$set:{token:randormstring}})
            sendResetPasswordMail(userData.name,userData.email,randormstring)
            res.status(200).send({success:true,msg:"please check your inbox of mail and reset your password"})            
        } else {
            res.status(200).send({success:false,msg:"this email does not exist"})
        }
    } catch (error) {
        // console.log(error.message)
    }
}

const forgetpassword  = async(req,res)=>{
        try {
            const token = req.query.token
            const tokendata = await User.findOne({token:token})
            if (tokendata) {
                res.render('forget-password',{user_id:tokendata._id})
            } else {
                res.status(200).send({success:true,msg:"this link is expired"})
               
            }
        } catch (error) {
            res.status(400).send({success:false,msg:error.message})
        }
    }

const forget_password = async(req,res)=>{
    try {
        const password = req.body.password
        const user_id = req.body.user_id
        
        const newpassword = await securePassword(password)
        const userData = await  User.findByIdAndUpdate({_id:user_id},{$set:{password:newpassword,token:''}})
    //    console.log(_id)
        res.status(200).send({success:true,msg:"User password has been reset"})
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const userall = async(req,res)=>{
    try {
        const userData = await User.find()
        // console.log(userData)
        res.json(userData)
    } catch (error) {
        console.log(error.message)
    }
}

const allusers  = async(req,res)=>{
    try {
        res.render('users/list')
    } catch (error) {
        res.status(400).send({success:false,msg:error.message})
    }
}

const edituser  = async(req,res)=>{
    try{
        const editusers = await User.findById(req.params.id)
        res.json(editusers)
    }catch(err){
        res.send('Error' + err)
    }
}

const delete_user = async(req,res)=>{
   try {
        const id  = req.params.id
        const delete_user = await User.findByIdAndDelete(req.params.id)
        res.json(delete_user)
   } catch (error) {
    res.status(400).send({success:false,msg:error.message})
   }
}

const updateUserlist = async(req,res)=>{
    try {
        if(req.file){
        const _id = req.params.id;
        const password =req.body.password;
        let updatedata={};
        if(password != ''){
            const spassword = await securePassword(req.body.password);
            updatedata.password=spassword;
        }
        updatedata.name=req.body.name;
        updatedata.mobile=req.body.mobile;
        updatedata.image=req.file.filename;
        const userData = await User.findByIdAndUpdate({_id:req.params.id},{$set:updatedata});

        res.json(userData);
    }else{
        const _id = req.params.id;
        const password =req.body.password;
        let updatedata={};
        if(password != ''){
            const spassword = await securePassword(req.body.password);
            updatedata.password=spassword;
        }
        updatedata.name=req.body.name;
        updatedata.mobile=req.body.mobile;
       
        const userData = await User.findByIdAndUpdate({_id:req.params.id},{$set:updatedata});
        res.json(userData);
    }
    } catch (error) {
        console.log(error.message);
    }
}


/**
 * User Profile ......
*/
const userProfile = async(req,res) =>{
    try {
       const _id = req.session.user_id
    //    console.log(_id)
        const userData = await User.findById({ _id:req.session.user_id })
    //    console.log(userData)
        res.json(userData)
    } catch (error) {
        // console.log(error.message)
    }
}

const user_Profile = async(req,res) =>{
    try {
       // const _id = req.session.user_id; 
        
        // const password =req.body.password;
         let updatedata={};
        // if(password != ''){
        //     const spassword = await securePassword(req.body.password);
        //     updatedata.password=spassword;
        // }
        // updatedata.name=req.body.name;
        // updatedata.mobile=req.body.mobile;
        // console.log('>>>>>',req.body);

        //  const userData = await User.findByIdAndUpdate({_id:req.session.user_id},{$set:updatedata});
// console.log(userData)
        // res.json(userData)
    } catch (error) {
        console.log(error.message)
    }
}

const Profile = async(req,res) =>{
    try {
        res.render('./profile')
    } catch (error) {
        console.log(error.message)
    }
}
const insertdata = async(req,res) =>{
    try {
        res.render('users/add')
    } catch (error) {
        console.log(error.message)
    }
    }


const insert_data = async(req,res)=>{
    try {
        const spassword = await securePassword(req.body.password)

        const user = new User({
            name:req.body.name,
            email:req.body.email,
            password:spassword,
            image:req.file.filename,
            mobile:req.body.mobile,
            is_admin:0
        })

        const userData = await User.findOne({email:req.body.email})
        if (userData) {
            res.status(200).send({success:false,msg:"this email is already exist"})
        } else {
            const userData = await user.save()
            // res.json(userData)
            // verificationMail(req.body.name,req.body.email,userData._id)
            res.status(200).send({success:true,data:userData,message:"your registration has been successfully please verify email"})
        }
        const response = {
            success:true,
            data:userData
        }
    } catch (error) {
        res.status(400).send(error.message)
    }
    
}

module.exports = {
    register_user,
    login_user,
    register,
    login,
    dashboard,
    forgetload,
    forgetverify,
    forgetpassword,
    forget_password,
    verifymail,
    allusers,
    userall,
    edituser,
    delete_user,
    logout,
    updateUserlist,
    userProfile,
    Profile,
    user_Profile,
    insert_data,
    insertdata
}