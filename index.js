//all imports
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userModel = require("./Models/userModel");
const { validateUser, generateJWTtoken, sendEmail } = require("./Utils/validateUser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { isAuth } = require("./middlewares/AuthMiddlearw");
const mongoDBsession = require("connect-mongodb-session")(session)
const todoModel = require("./Models/todoModel");
const { JsonWebTokenError } = require("jsonwebtoken");

//all variables
const app = express();
const mongo_URI = process.env.mongo_URI
const store = new mongoDBsession({
    uri: process.env.mongo_URI,
    collection: "sessions",
})

//all middlewares here
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Place this before your route definitions
app.use(express.json());
app.use(session({
    secret:"Todo appplication nodejs",
    saveUninitialized:false,
    resave:false,
    store:store,
}))
app.use(express.static("public"))

//DB connections
mongoose.connect(mongo_URI)
    .then(()=>console.log("mongoDB connected"))
    .catch((error)=>console.log("DB connection couldnt be done"));

app.get("/register", (req,res)=>{
    return res.render("registrationPage");
});

app.post("/register",async (req, res)=>{
    // console.log(req.body);
    const {name, email,username, password} = req.body;

    // try {
    //     const token = await generateJWTtoken(email);
    //     sendEmail(email, token);
    //     return res.status(200).send("verify your email");
    // } catch(error) {
    //     return res.status(500).send({
    //         message: error.message, // Use error.message to get the error message
    //         status: 500
    //     });
    // }
    
    

    try{
        await validateUser({name, email, username, password});
    }
    catch(error){
       return res.send({
            status:400,
            message:"user data error"
        })
    }

    //check if email and username is unique
    const isEmailUnique = await userModel.findOne({email:email})
    if(isEmailUnique){
        return res.send({
            status:400,
            message:"email already exist"
        })
    }

    const isUserNameUnique = await userModel.findOne({username})
    if(isUserNameUnique){
        return res.send({
            status:400,
            message:"username already exist"
        }) 
    }

    //hashing the password
   const encrypted_Password = await bcrypt.hash(password, 10)

    

    const userObj = new userModel({
        name:name,
        email:email,
        username:username,
        password: encrypted_Password,
    })

    try{
        const userDB = await userObj.save();
        return res.redirect("/login")
    }
    catch(error){
        return res.send("error: ",error)
    }
});

//login function

app.get("/login", (req, res)=>{
    res.render("loginpage")
})

app.get("/allusers", async(req,res)=>{
    const userDB = await userModel.find();
    console.log(userDB)
    return res.send({result:userDB})
})

app.post("/login", async(req, res)=>{
    const {email, password} = req.body;
    // console.log(req.session)

    if( !email || !password){
        return res.send({
            status:400,
            message:"Email and password are mandatory"
        })
    }

    try{
        const userDB = await userModel.findOne({email})
        // console.log("userDB this is",userDB)
        if(!userDB){
            return res.send({status:400, message:"user not found"})
        }
        const isMatched = await bcrypt.compare(password, userDB.password);
        if(!isMatched){
            return res.send({status:400, message:"password incorrect"})
        }
        
        req.session.isAuth =true;
        req.session.user = {
            userId: userDB._id,
            email: userDB.email,
            username: userDB.name,
          };
        return res.redirect("/dashboard")
    }
    catch(error){
        return res.send({status:400, message:error})
    } 
})


app.get("/dashboard", isAuth, (req, res)=>{
    return res.render("dashboard");
})

app.post("/logout", (req, res)=>{
    req.session.destroy((error)=>{
        if(error){
            return res.send({status:500, message:"internal server error"})
        }
        else{
            return res.redirect("/login")
        }
    })
})

app.post("/logout_from_all_devices", isAuth, async(req, res)=>{

    const username = req.session.user.username
    console.log(req.session.user.username)
    const sessionSchema = new mongoose.Schema({ _id: String }, { strict: false });
    const sessionModel = mongoose.model("session", sessionSchema)

    try{
        const deleteDb = await sessionModel.deleteMany({"session.user.username": username})
        //console.log(deleteDb)
        return res.redirect("/login")
    }
    catch(error){
        return res.send({
            status:500,
            message:"internal server error"
        })
    }
})

app.post("/create-todo",isAuth, async(req, res)=>{
    const {todo} = req.body;

    const todoObj = new todoModel({
        todo:todo,
        name:req.session.user.username,
    })

    try{
        const todoDB = await todoObj.save();
        // console.log(todoDB)
        return res.status(200).json({ message: "Todo created successfully" });
    }
    catch(error){
        return res.send({
            status:400,
            message:"something went wrong",
            error:error
        })
    }
    // return res.send(req.body)
})

app.get("/get-todo",isAuth, async (req, res)=>{
   
    const name = req.session.user.username;

    const todosDB = await todoModel.find({name})
    // console.log(todosDB)
    return res.send(todosDB)
})

app.put("/edit-todo", async(req, res)=>{
    const {id, newtodo} = req.body;

    try{
        const edittodo = await todoModel.findOneAndUpdate({_id:id}, {todo:newtodo})
        console.log(edittodo)
        if(edittodo.name !== req.session.user.userame){
            console.log("name is correct")
        }else{
            console.log("incorrect user updated")
        }
        return res.send("todo updated");
    }
    catch(error){
        return res.send("couldnt update try again")
    }
    
})

app.post("/delete-todo", async(req, res)=>{
    const id = req.body.id;
    console.log(id)
    try{
        const deleteTodo = await todoModel.findOneAndDelete({_id:id})
        // console.log(deleteTodo);
        return res.send({"id":id, message:"todo successfully deleted"});
    }
    catch(error){
        return res.send({
            status:500,
            message:"couldnt delete todo"
        })
    }
    
})


app.listen("8000", ()=>{
    console.log("Server is running");
});
