const studentModel = require('../schema/student')
const teacherModel = require('../schema/teacher')

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


//===========================================view and filter=================================================


const getStudents = async function (req, res) {
    let data = req.query
    let userId = req.token
    let obj = {}
    obj.user = userId
    obj.isDeleted = false
    if (Object.keys(data).length == 0) {
        let allStudents = await studentModel.find({ user: userId, isDeleted: false })
        return res.status(200).send({ status: true, data: allStudents })
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



module.exports = { createStudent, getStudents }




