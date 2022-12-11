const express = require("express")
const router = express.Router()
const {registerTeacher, login} = require('../controller/teacherController')
const {getStudents, updateDetails, addStudent, deleteStudent} = require('../controller/studentController')
const {authentication} = require('../authentication/auth')


router.post('/register',registerTeacher)
router.post('/login',login)

router.post('/addstudent',authentication,addStudent)
router.get('/getList',authentication,getStudents)
router.put('/updateProfile/:studentId', authentication, updateDetails)
router.delete('/deleteProfile/:studentId', authentication, deleteStudent)


module.exports = router