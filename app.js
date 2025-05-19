// npm init -y
// npm i
// npm express
// npm ejs
//   npm install ejs-mate --save 
// npm install connect-flash express-session  without express-session flash didnt work
// npm install dotenv

if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate")
const path = require("path")
const mongoose = require("mongoose");
const Task = require("./models/task");
const methodOverride = require('method-override'); // it uses when need to deletion
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require("./utils/ExpressError.js");


const dbUrl = process.env.ATLASDB_URL;


// main().then( ()=>{
//     console.log("MongoDB connected");
// })
// .catch(err => console.log(err));
// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/todoApp'); // 
// }

// connect to mongodb atlas
mongoose.connect(dbUrl,{
    useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // optional timeout
})
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });


app.use(express.urlencoded({ extended: true }));

app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.get("/",(req,res)=>{
    res.render("home");
});

// Show the form and the list of tasks
app.get("/addtask", async(req,res)=>{
    const tasks = await Task.find({});
    res.render("listings/addtask",{tasks});
});

//add task
app.post("/addtask", async (req, res) => {
    const { description } = req.body;

    if (!description || description.length < 3) {
    req.flash('error', 'Task must be at least 3 characters long');
    return res.redirect('/addtask');
  }
    await Task.create({ description });
    req.flash('success','Task Added successfully');
    res.redirect("/addtask");
});


// checke box
app.put("/addtask/:id",async(req,res)=>{
    try{
        const taskId = req.params.id;

        const done = req.body.done === 'on';

        let marked = await Task.findByIdAndUpdate(taskId,{done});
        // console.log(marked);
        res.redirect("/addtask");
    }catch(err){
        console.log("checked err",err);
    }
})

// edit task route
app.get("/edittask/:id",async(req,res)=>{
    const {id} = req.params;
    const task = await Task.findById(id);
    res.render("listings/edittask",{task});
});

// edit task
app.put("/edittask/:id", async(req,res)=>{
    const {id} = req.params;
    const {description} = req.body;
    let updatedTask = await Task.findByIdAndUpdate(id,{description});
    await updatedTask.save();

    res.redirect("/addtask");
});

// delete task
app.delete("/addtask/:id",async(req,res)=>{
    try{
    const {id} = req.params;
    let deletedTask = await Task.findByIdAndDelete(id);
    console.log("deleted task",deletedTask);
    res.redirect("/addtask");
    }catch(err){
        console.log(err);
    }
});

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

//Error handling
app.use((err,req,res,next)=>{
    let{statusCode=500, message="Somthing went wrong"} =err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8085,(req,res)=>{
    console.log("server is listening at port 8085");
});
