const { Mongoose, default: mongoose } = require('mongoose')
const studentModel = require('../schema/student')


//=============================================validations==================================================

const validName = function (name) {
    if (/^[a-zA-Z ]*$/.test(name)) return true
    else return false
}

const validMarks = function (marks) {
    if (marks >= 0 && marks <= 100) return true
    else return false
}

const validSubject = function (subject) {
    if (!["maths", "science", "history", "geography", "english", "javascript", "java"].includes(subject)) return false
    else return true
}


//==========================================create and add student=============================================================

const addStudent = async (req, res) => {
    try {
        let data = req.body
        let userId = req.token

        if (!Object.keys(data)) {
            return res.status(400).send({ status: false, msg: "Body can't be empty. Provide data" })
        }

        let { name, subject, marks, ...rest } = data
        if (Object.keys(rest).length > 0) { return res.status(400).send({ status: false, msg: "Provide only name,subject,marks" }) }

        if (!(name && subject && marks)) return res.status(400).send({ status: false, msg: "Name,Marks and Subject are mandatory fields" })

        if (!validName(name)) return res.status(400).send({ status: false, msg: "Invalid format of name" })
        if (!validMarks(marks)) return res.status(400).send({ status: false, msg: "Invalid format of marks" })
        if (!validSubject(subject.toLowerCase())) return res.status(400).send({ status: false, msg: `Wrong Subject. Subject should be ["maths", "science", "history", "geography", "english", "javascript", "java"]` })

        let presentStudent = await studentModel.findOne({ name: { $regex: name, $options: "$i" }, subject: { $regex: subject, $options: 'i' }, isDeleted: false })
        if (presentStudent) {
            if (presentStudent.user.toString() !== userId) {
                return res.status(403).send({ status: false, msg: "You are not permitted to update this student's profile" })
            }
            else {
                presentStudent.marks = presentStudent.marks + marks
                presentStudent.save()
                return res.status(200).send({ status: true, msg: "Marks are updated", data: presentStudent })
            }
        }
        else {
            data.user = userId
            let newStudent = await studentModel.create(data)
            return res.status(201).send({ status: true, msg: "Student is added Successfully", data: newStudent })
        }
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
    }
}


//===========================================view and filter Api====================================================================================


const getStudents = async function (req, res) {
    try {
        let data = req.query
        let userId = req.token

        let obj = {}
        obj.user = userId
        obj.isDeleted = false

        if (Object.keys(data).length == 0) {
            let allStudents = await studentModel.find({ user: userId, isDeleted: false })
            if (allStudents.length == 0) return res.status(200).send({ status: true, msg: "No student is registered yet" })
            return res.status(200).send({ status: true, msg: "Student List", data: allStudents })
        }

        if (data.name) {
            obj.name = { $regex: data.name, $options: 'i' }
        }

        if (data.subject) {
            obj.subject = { $regex: data.subject, $options: 'i' }
        }

        let getList = await studentModel.find({ ...obj })
        if (getList.length == 0) return res.status(400).send({ status: false, msg: "No student found" })
        return res.status(200).send({ status: true, msg: "Student List", data: getList })

    }
    catch (err) {
        return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
    }
}


//===========================================update api=======================================================

const updateDetails = async (req, res) => {
    try {
        let studentId = req.params.studentId
        let userId = req.token
        let data = req.body
        let { name,subject } = data

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).send({ status: false, message: "Invalid Student Id" })
        }

        let findStudent = await studentModel.findOne({ _id: studentId, isDeleted: false })
        if (!findStudent) return res.status(404).send({ status: false, msg: "No profle found or may be deleted" })

        if (findStudent.user.toString() !== userId) return res.status(403).send({ status: false, msg: "Unauthorized Person to update profile" })
        
        if (name && name !== undefined) {
            if (typeof name != "string" || !validName(name)) return res.status(400).send({ status: false, msg: "Invalid format of name" })
        }
        if (subject && !validSubject(subject.toLowerCase())) return res.status(400).send({ status: false, msg: `Wrong Subject. Subject should be ["maths", "science", "history", "geography", "english", "javascript", "java"]` })

        if(name && subject){
            let alreadyPresent = await studentModel.findOne({name : name, subject : subject})
                if(alreadyPresent){
                    return res.status(409).send({status : false, msg : "Student profile is already present with this name and subject"})
                }
            let obj = {
                name : name,
                subject : subject
            }    
            let updateDetails = await studentModel.findOneAndUpdate({ _id: studentId, isDeleted: false }, { $set: obj}, { new: true })
            return res.status(200).send({ status: true, msg: "Profile Updated Successfully", data: updateDetails })            
        }
        
        if(name || subject){
            if(name){                
                let updateDetails = await studentModel.findOneAndUpdate({ _id: studentId, isDeleted: false }, { $set: { name: name } }, { new: true })
                return res.status(200).send({ status: true, msg: "Profile Updated Successfully", data: updateDetails })
            }
            else{               
                let alreadyPresent = await studentModel.findOne({name : name, subject : subject})
                if(alreadyPresent){
                    return res.status(409).send({status : false, msg : "Student profile is already present with this name and subject"})
                }
                let updateDetails = await studentModel.findOneAndUpdate({ _id: studentId, isDeleted: false }, { $set: { subject: subject } }, { new: true })
                return res.status(200).send({ status: true, msg: "Profile Updated Successfully", data: updateDetails })
            }
        }
    }
    catch (err) {
        return res.status(500).send({ msg: "Server Error", err: err.message })
    }
}


//===========================================Delete Student Profile=======================================================================


const deleteStudent = async (req, res) => {
    try {
        let studentId = req.params.studentId
        let userId = req.token

        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).send({ status: false, message: "Invalid Student Id" })
        }

        let student = await studentModel.findOne({ _id: studentId, isDeleted: false })
        if (!student) return res.status(404).send({ status: false, msg: "No profile found or may be deleted" })

        if (student.user.toString() !== userId) return res.status(403).send({ status: false, msg: "Unauthorized Person to delete this student's profile" })

        let deleteProfile = await studentModel.findOneAndUpdate({ _id: studentId, isDeleted: false }, { isDeleted: true }, { new: true })
        return res.status(200).send({ status: true, msg: "Profile Deleted Successfully" })
    }
    catch (err) {
        return res.status(500).send({ msg: "Server Error", err: err.message })
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


module.exports = { addStudent, getStudents, updateDetails, deleteStudent }



