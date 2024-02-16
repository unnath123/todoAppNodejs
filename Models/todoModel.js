const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    todo:{
        type:String,
        required: true,
    },
    name:{
        type:String,
        required: true,
    }
})

const todoModel = mongoose.model("todo",todoSchema)
module.exports = todoModel