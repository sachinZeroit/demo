// const jwt  = require('jsonwebtoken')
// const config = require('../config/config')
/**
 * Check user login or not...
*/
const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){}
        else{
            res.redirect('/login')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('admin/dashboard')
        }
        next()
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
isLogin,
isLogout
}