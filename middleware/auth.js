const jwt  = require('jsonwebtoken')
const config = require('../config/config')

const verifyToken = async(req,res,next)=>{
    const token  = req.headers["authorization"] ||  req.query.token  || req.body.token


    if (!token) {
        res.status(200).send({success:false,msg:"a token is required for authorization"})
    } 
    try {
        const descode = jwt.verify(token,config.secret_jwt)
        req.user = descode
    } catch (error) {
        res.status(400).send({success:false,msg:"invalid token"})
    }
    return next()
}


module.exports= verifyToken