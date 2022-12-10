const jwt = require('jsonwebtoken')
//const studentModel = require('../schema/student')
//const teacherModel = require('../schema/teacher')

const authentication = async (req,res,next)=>{
    try{
        let token = req.headers["x-api-key"]
        if(!token){
            return res.status(400).send({status : false, msg : "Token is required"})
        }
        
        jwt.verify(token, "loggedIn", function(err,decodedToken){
            if(err){
                return res.status(401).send({status : false, msg : "Invalid Token"})
            }
            else{
                req.token = decodedToken.userId
                next()
            }
        })

    }
    catch(err){
        return res.status(500).send({msg : "Server Error", err : err.message})

    }
}

module.exports = {authentication}
