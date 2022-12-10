const mongoose = require('mongoose')

const teacherSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    }

},{timestamps : true})

module.exports = mongoose.model("Teacher",teacherSchema)