//all imports
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userModel = require("./Models/userModel");
const { validateUser } = require("./Utils/validateUser");
const bcrypt = require("bcrypt");
const session = require("express-session");
const { isAuth } = require("./middlewares/AuthMiddlearw");
const mongoDBsession = require("connect-mongodb-session")(session)

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

//DB connections
mongoose.connect(mongo_URI)
    .then(()=>console.log("mongoDB connected"))
    .catch((error)=>console.log("DB connection couldnt be done"));

app.get("/register", (req,res)=>{
    return res.render("registrationPage");
});

app.post("/register",async (req, res)=>{
    console.log(req.body);

    const {name, email,username, password} = req.body;

    try{
        await validateUser({name, email, username, password});
    }
    catch(error){
        res.send({
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
            username: userDB.username,
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












app.listen("8000", ()=>{
    console.log("Server is running");
});
