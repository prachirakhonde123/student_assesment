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
  


//===========================================Register=====================================================

const registerTeacher = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length===0) {
            return res.status(400).send({ status: false, msg: "Provide data for registration" })
        }

        let { email, phone, password } = data

        if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" })
        if(!isValidEmail(email)) return res.status(400).send({ status: false, msg: "Email is invalid" })
        let duplicateEmail = await teacherModel.findOne({email : email})
        if(duplicateEmail) return res.status(400).send({ status: false, msg: "Email is already present" })

        if (!phone) return res.status(400).send({ status: false, msg: "Phone number is mandatory" })
        if(!isvalidPhone(phone)) return res.status(400).send({ status: false, msg: "Phone is invalid" })
        let duplicatePhone = await teacherModel.findOne({phone : phone})
        if(duplicatePhone) return res.status(400).send({ status: false, msg: "Phone is already present" })

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
        if (!Object.keys(data)) {
            res.status(400).send({ status: false, msg: "Provide data for login" })
        }

        let { phone, email, password } = data
        if (phone && password) {
            if(!isvalidPhone(phone)) return res.status(400).send({ status: false, msg: "Phone is invalid" })
            if(!validPassword(password)) return res.status(400).send({ status: false, msg: "Password must of 8-15 length" })
            let validUser = await teacherModel.findOne({ phone: phone})
            if (!validUser) {
                return res.status(401).send({ status: false, msg: "No such a user" })
            }
            let validPass = await bcrypt.compare(password,validUser.password)
            if(!validPass) {
                return res.status(401).send({ status: false, msg: "Invalid Credentials" })
            }
            else {
                let token = jwt.sign({
                    userId: validUser._id
                }, "loggedIn")

                let decode = jwt.decode(token, "loggedIn")
                return res.status(200).send({status : true,msg : "Logged in successfully", data : {token : token, user : decode.userId}})
            }
        }
        else if (email && password) {
            if(!isValidEmail(email)) return res.status(400).send({ status: false, msg: "Email is invalid" })
            if(!validPassword(password)) return res.status(400).send({ status: false, msg: "Password must of 8-15 length" })
            let validUser = await teacherModel.findOne({ email: email})
            if (!validUser) {
                return res.status(404).send({ status: false, msg: "Invalid Credentials" })
            }
            let validPass = await bcrypt.compare(password,validUser.password)
            if(!validPass){
                return res.status(401).send({ status: false, msg: "Invalid Credentials" })
            }

            else {
                let token = jwt.sign({
                    userId: validUser._id
                }, "loggedIn")

                let decode = jwt.decode(token, "loggedIn")       
                return res.status(200).send({status : true, msg : "Logged in successfully",data : {token : token, user : decode.userId}})
            }
        }

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