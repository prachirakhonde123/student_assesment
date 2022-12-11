const studentModel = require('../schema/student')
const { findByIdAndUpdate } = require('../schema/teacher')
const teacherModel = require('../schema/teacher')


//=============================================validations==================================================

const validName = function (name){
    if(/^[a-zA-Z ]*$/.test(name)) return true
    else return false
}

const validMarks = function (marks){
    if(marks>=0 && marks<=100) return true
    else return false
}

const validSubject = function (subject){
    if(!["maths","science","history","geography","english"].includes(subject)) return false
    else return true
}


//========================================Create Student============================================

const createStudent = async (req, res) => {
    try {
        let data = req.body
        let userId = req.token

        if (!Object.keys(data)) {
            return res.status(400).send({ status: false, msg: "Body can't be empty. Provide data" })
        }

        //____________________________Checking whether user is valid________________________________
        let validUser = await teacherModel.findById(userId)
        if (!validUser) return res.status(404).send({ status: false, msg: "No such a User" })


        //_____________________________Validations__________________________________________________
        let { name, subject, marks, ...rest } = data
        if (!(name && subject && marks)) return res.status(400).send({ status: false, msg: "Name,Marks,User and Subject are mandatory fields" })
        if (Object.keys(rest).length > 0) { return res.status(400).send({ status: false, msg: "Provide only name,subject,marks" }) }

        if(!validName(name)) return res.status(400).send({status : false, msg : "Invalid format of name"})
        if(!validMarks(marks)) return res.status(400).send({status : false, msg : "Invalid format of marks"})
        if(!validSubject(subject.toLowerCase())) return res.status(400).send({status : false, msg : "Invalid Subject"})


        //______________________Finding student whether it is present or not___________________________ 
        let presentStudent = await studentModel.findOne({ name: name, subject: subject, isDeleted: false })
        if (presentStudent) {
            return res.status(200).send({ status: true, msg: "Student is already present" })
        }

        //__________________________Creating student______________________________________________
        else {
            data.user = userId
            let newStudent = await studentModel.create(data)
            return res.status(201).send({ status: true, msg: "Student is added", data: newStudent })
        }
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
    }
}


//==========================================post api=============================================================

const addStudent = async (req, res) => {
    try {
        let data = req.body
        let userId = req.token

         //____________________________Checking whether user is valid________________________________
         let validUser = await teacherModel.findById(userId)
         if (!validUser) return res.status(404).send({ status: false, msg: "No such a User" })

        if (!Object.keys(data)) {
            return res.status(400).send({ status: false, msg: "Body can't be empty. Provide data" })
        }

        let { name, subject, marks, ...rest } = data

        if (!(name && subject && marks)) return res.status(400).send({ status: false, msg: "Name,Marks,User and Subject are mandatory fields" })
        if (Object.keys(rest).length > 0) { return res.status(400).send({ status: false, msg: "Provide only name,subject,marks" }) }
        
        if(!validName(name)) return res.status(400).send({status : false, msg : "Invalid format of name"})
        if(!validMarks(marks)) return res.status(400).send({status : false, msg : "Invalid format of marks"})
        if(!validSubject(subject.toLowerCase())) return res.status(400).send({status : false, msg : "Invalid Subject"})

        let presentStudent = await studentModel.findOne({ name: name, subject: subject , isDeleted : false})
        if (presentStudent) {
            if(presentStudent.user.toString() !== userId){
                return res.status(404).send({ status: false, msg: "Student is present but you cannot update it" })
            }                    
            else {
               presentStudent.marks = presentStudent.marks + marks
               presentStudent.save()
               return res.status(200).send({ status: true, msg: "Marks are updated", data : presentStudent})
            }
        }
       else {
            data.user = userId
            let newStudent = await studentModel.create(data)
            return res.status(201).send({ status: true, msg: "Student is added", data: newStudent })
        }
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
    }
}


//===========================================view and filter=================================================


const getStudents = async function (req, res) {
    try {
        let data = req.query
        let userId = req.token
        
        let validUser = await teacherModel.findById(userId)
        if(!validUser){
            return res.status(401).send({status : false, msg : "Unauthorized person"})
        }

        let obj = {}
        obj.user = userId
        obj.isDeleted = false

        if (Object.keys(data).length == 0) {
            let allStudents = await studentModel.find({ user: userId, isDeleted: false })
            if(allStudents.length==0)  return res.status(200).send({ status: true, msg : "No student is registered yet"})
            return res.status(200).send({ status: true, msg : "Student List", data: allStudents })
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

const updateStudent = async (req, res) => {
    try {
        let data = req.body
        let userId = req.token
        //let filter = {}

        let validUser = await teacherModel.findById(userId)
        if(!validUser){
            return res.status(401).send({status : false, msg : "Unauthorized person"})
        }

        let { name, subject, marks } = data

        if (!Object.keys(data)) return res.status(400).send({ status: false, msg: "Provide data to update" })

        if (!(name && subject && marks)) return res.status(400).send({ status: false, msg: "Name,Subject,Marks are mandatory field" })
        if(!validMarks(marks)) return res.status(400).send({status : false, msg : "Invalid format of marks"})

        let findStudent = await studentModel.findOne({ name: name, subject: subject, isDeleted: false })
        if (!findStudent) return res.status(404).send({ status: false, msg: "No such a student or the data may be deleted" })

        let user = findStudent.user.toString()
        if (user !== userId) return res.status(403).send({ status: false, msg: "Unauthorized Person to update data" })
        
        // if(marks){
        //     filter.marks = findStudent.marks + marks
        // }
        findStudent.marks = findStudent.marks + marks
        findStudent.save()

        return res.status(200).send({ status: true, msg: "Marks are updated", data: findStudent })
    }

    catch (err) {
        return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
    }
}


//===========================================Delete Student Profile=========================================

const deleteStudent = async (req, res) => {
    try {
        let data = req.body
        let userId = req.token

        let { name, subject, ...rest } = data

        let validUser = await teacherModel.findById(userId)
        if(!validUser){
            return res.status(401).send({status : false, msg : "Unauthorized person"})
        }

        if (Object.keys(data).length==0) return res.status(400).send({ status: false, msg: "Provide data of student" })
        if (Object.keys(rest).length > 0) return res.status(400).send({ status: false, msg: "Providing invalid data" })
        if (!(name && subject)) return res.status(400).send({ status: false, msg: "Name and Subject are mandatory" })

        let student = await studentModel.findOne({ name: name, subject: subject, isDeleted: false })
        if (!student) return res.status(400).send({ status: false, msg: "No student Profile or it may be deleted" })

        let user = student.user.toString()
        if (user !== userId) return res.status(403).send({ status: false, msg: "You are unauthorized to delete the profile" })

        let deleteProfile = await studentModel.findOneAndUpdate(
            { name: name, subject: subject, isDeleted: false },
            { isDeleted: true },
            { new: true })
        return res.status(200).send({ status: true, msg: "Profile of Student is deleted" })
    }
    catch(err){
        return res.status(500).send({msg : "Server Error", err : err.message})
    }
}




module.exports = { createStudent, getStudents, updateStudent, deleteStudent, addStudent}



/*
const addStudent = async (req, res) => {
     try {
         let data = req.body
         let userId = req.token

         if (!Object.keys(data)) {
             return res.status(400).send({ status: false, msg: "Body can't be empty. Provide data" })
         }

         let { name, subject, marks, user, ...rest } = data

         if (!(name && subject && marks && user)) return res.status(400).send({ status: false, msg: "Name,Marks,User and Subject are mandatory fields" })

         if (Object.keys(rest).length > 0) { return res.status(400).send({ status: false, msg: "Provide only name,subject,marks" }) }

         let presentStudent = await studentModel.findOne({ name: name, subject: subject , isDeleted : false})
         if (presentStudent) {
             if(presentStudent.user.toString() !== userId){
                 return res.status(404).send({ status: false, msg: "Student is present but you cannot update it" })
             }
            //let student = await studentModel.findOne({ name: name, subject: subject, user: user })
             // if (!student) {
             //     return res.status(404).send({ status: false, msg: "Student is present but you cannot update it" })
             // }           
             else {
                presentStudent.marks = student.marks + marks
                presentStudent.save()
                return res.status(201).send({ status: true, msg: "Marks are updated", data : student})
             }
         }

        else {
             let newStudent = await studentModel.create(data)
             return res.status(201).send({ status: true, msg: "Student is added", data: newStudent })
         }
     }
     catch (err) {
         return res.status(500).send({ status: false, msg: "Server Error", err: err.message })
     }
 }

//================================================update details===========================================

const updateDetails = async (req,res)=>{
    let studentId = req.params
    let userId = req.token
    let data = req.body
    let {name,subject} = data
    
    let validUser = await teacherModel.findById(userId)
        if(!validUser){
            return res.status(401).send({status : false, msg : "Unauthorized person"})
    }

    let findStudent = await studentModel.findById({studentId})
    if(!findStudent) return res.status(404).send({status : false, msg : "No profle found"})
    if(findStudent.isDeleted == true) return res.status(400).send({status : false, msg : "Student profile is deleted"})
    
    if(name){
        let updateStudent = await findByIdAndUpdate(studentId,{name : name})
    }
}



*/




