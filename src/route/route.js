const express = require("express")
const router = express.Router()
const {registerTeacher, login} = require('../controller/teacherController')
const {createStudent,getStudents} = require('../controller/studentController')
const {authentication} = require('../authentication/auth')


// router.get("/login",(req,res)=>{
//     console.log("Hiiii");
//     res.send({msg : "heloooooooooooooo"})
// })

router.post('/register',registerTeacher)
router.post('/login',login)

//router.post('/student',createStudent)
router.post('/student',authentication,createStudent)
router.get('/getList',authentication,getStudents)


module.exports = router