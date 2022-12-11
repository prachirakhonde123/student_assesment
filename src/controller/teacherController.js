const teacherModel = require('../schema/teacher')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')


//==========================================validations====================================================
const isValidEmail = function (mail) {
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(mail)) { return true;}
    return false;
};

const isvalidPhone = function (mobile) {
    if (/^(\+91[\-\s]?)?[0]?[6789]\d{9}$/.test(mobile)) return true;
    return false;
};

const validPassword = function (password){
    if (/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password)) return true;
    return false;
}

const validName = function (name){
    if(/^[a-zA-Z ]*$/.test(name)) return true
    else return false
}


//===========================================Register=====================================================

const registerTeacher = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length===0) {
            return res.status(400).send({ status: false, msg: "Provide data for registration" })
        }

        let { name, email, phone, password, ...rest} = data

        if(Object.keys(rest).length>0) return res.status(400).send({status : false, msg : "Register with name, email, phone and password"})

        if(!name || typeof name != "string" || !validName(name)){
            return res.status(400).send({ status: false, msg: "Name is mandatory and it should conatin only alphabets" })
        }

        if (!email || !isValidEmail(email)) return res.status(400).send({ status: false, msg: "Valid Email is required" })
    
        if (!phone || typeof phone != "string" || !isvalidPhone(phone)) return res.status(400).send({ status: false, msg: "10 digit Indian Phone number is mandatory" })
       
        let duplicateEmailandMobile = await teacherModel.findOne({$or : [{email : email}, {phone : phone}]})
        if(duplicateEmailandMobile){
            if(duplicateEmailandMobile.email === email){
                return res.status(400).send({ status: false, msg: "Email is already present" })
            }
            else if(duplicateEmailandMobile.phone === phone){
                return res.status(400).send({ status: false, msg: "Phone is already present" })
            }
        }

        if (!password) return res.status(400).send({ status: false, msg: "Password is mandatory" })
        if(!validPassword(password)) return res.status(400).send({ status: false, msg: "Password must of 8-15 length" })

        let securedPass = await bcrypt.hash(password,10)
        data.password = securedPass

        let user = await teacherModel.create(data)
        res.status(201).send({ status: true, msg: "Teacher is registered successfully", data: user })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


//===================================================Login======================================================


const login = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Provide data for login" })
        }
        
        //___________________Login with Phone and Password________________________________
        let { phone, email, password } = data
        if (phone && password) {
            let validUser = await teacherModel.findOne({ phone: phone})
            if (!validUser) {
                return res.status(401).send({ status: false, msg: "Invalid Phone" })
            }
            let validPass = await bcrypt.compare(password,validUser.password)
            if(!validPass) {
                return res.status(401).send({ status: false, msg: "Please Confirm your password. It's incorrect"  })
            }
            else {
                let token = jwt.sign({userId: validUser._id}, "loggedIn", {expiresIn : "5h"})
                return res.status(200).send({status : true,msg : "Logged in successfully", data : token})
            }
        }
        
        //____________________________Login with email and Password________________________________
        else if (email && password) {
            let validUser = await teacherModel.findOne({ email: email})
            if (!validUser) {
                return res.status(404).send({ status: false, msg: "Invalid Email" })
            }
            let validPass = await bcrypt.compare(password,validUser.password)
            if(!validPass){
                return res.status(401).send({ status: false, msg: "Please Confirm your password. It's incorrect" })
            }

            else {
                let token = jwt.sign({userId: validUser._id}, "loggedIn")
                return res.status(200).send({status : true, msg : "Logged in successfully",data : token})
            }
        }
        
        //___________________________________Wrong data provided______________________________
        else{
            return res.status(400).send({status : false, msg : "Provide either Email&Password or Phone&Password for login"})
        }       
    }

    catch (err) {
        return res.status(500).send({msg : "Server Error", err : err.message})
    }
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = { registerTeacher , login}