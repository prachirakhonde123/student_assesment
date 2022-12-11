const express = require("express")
const router = express.Router()
const {registerTeacher, login} = require('../controller/teacherController')
const {createStudent,getStudents, updateStudent, addStudent, deleteStudent} = require('../controller/studentController')
const {authentication} = require('../authentication/auth')


// router.get("/login",(req,res)=>{
//     console.log("Hiiii");
//     res.send({msg : "heloooooooooooooo"})
// })

router.post('/register',registerTeacher)
router.post('/login',login)

router.post('/student',authentication,createStudent)
router.post('/addstudent',authentication,addStudent)
router.get('/getList',authentication,getStudents)
router.put('/updateMarks',authentication, updateStudent)
router.put('/deleteProfile', authentication, deleteStudent)


module.exports = router