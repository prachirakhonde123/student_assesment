const teacherModel = require('../schema/teacher')
const jwt = require('jsonwebtoken')

//===========================================Register=====================================================

const registerTeacher = async function (req, res) {
    try {
        let data = req.body
        if (!Object.keys(data)) {
            res.status(400).send({ status: false, msg: "Provide data for registration" })
        }

        let { email, phone, password } = data
        if (!email) return res.status(400).send({ status: false, msg: "Email is mandatory" })
        if (!phone) return res.status(400).send({ status: false, msg: "Phone number is mandatory" })
        if (!password) return res.status(400).send({ status: false, msg: "Phone number is mandatory" })

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
            let validUser = await teacherModel.findOne({ phone: phone, password: password })
            if (!validUser) {
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
            let validUser = await teacherModel.findOne({ email: email, password: password })
            if (!validUser) {
                return res.status(404).send({ status: false, msg: "Invalid Credentials" })
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

module.exports = { registerTeacher , login}