const express = require('express')
const app = express()
const port = 1904
const path = require ("path")
const config = require("./config/config.json")
const {Sequelize, QueryTypes} = require("sequelize")
const sequelize = new Sequelize(config.development)
const blogModel = require("./models").tb_blog;
const UserModel = require("./models").tb_user;
const bcrypt = require("bcrypt")
const session = require("express-session")

app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, "./pages"))
app.use("/assets", express.static(path.join(__dirname,"./assets")))
app.use(express.urlencoded({extended:false}))
app.use(session({
    name:"first_session",
    secret:"confidential",
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        maxAge:1000 * 60 * 60 *  24
    },
}))

// rute
app.get("/", home)
app.get("/index", home)
app.post("/edited", editedBlog)
app.post("/delete-post/:id", deletePost)
app.get("/blog-Edit/:id", blogEdit)
app.get("/addProjectBootstrap", project)
app.post("/addProjectBootstrap", addProject)
app.get("/testi", testi)
app.get("/backpageBootstrap", contact)
app.get("/project/:id", blogDetail)
app.get("/register", registView)
app.get("/login", loginView)
app.post("/register", register)
app.post("/login", logIn)
app.post("/logout", logOut)



// control
function registView(req,res) {
    res.render("register")  
}


async function register(req,res) {
    const{name,email,password}=req.body

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO tb_users (name,email,password,"createdAt","updatedAt") VALUES('${name}','${email}','${hashedPassword}', now(), now())`;
    const data = await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/")
}


function loginView(req,res) {
    res.render("login")  
}


async function logIn(req,res) {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      where: { email },
    });
  
    if (!user) return res.redirect("/login");

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) return res.redirect("/login");

    req.session.loggedIn = true;
    req.session.user = {
      name: user.name,
      email: user.email,
    };

    res.redirect("/"); 
}


async function logOut(req, res) {
    req.session.destroy(function (err) {
      if (err) return console.error("FAILED!!");
  
      console.log("Logout success!");
      res.redirect("/");
    });
  }


async function home(req,res) {
    const query ="SELECT * FROM tb_blogs";
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });

    const loggedIn = req.session.loggedIn
    const user = req.session.user
    res.render("index", {data, loggedIn, user})  
}


function project(req,res) {
    res.render("addProjectBootstrap")  
}


async function deletePost(req,res) {
    const {id} = req.params; 
    const query = `DELETE FROM tb_blogs WHERE id=${id}`;
    const data = await sequelize.query(query, { type: QueryTypes.DELETE });

    res.redirect("/")
}


async function blogEdit(req,res) {
    const {id} = req.params;
    const data = await blogModel.findOne({
        where: { id },
      });

    res.render("blog-Edit", {data})  
}


async function editedBlog(req,res) {
    const {tittle, content, id} = req.body
    const query  = `UPDATE public.tb_blogs SET tittle='${tittle}', content='${content}' WHERE id=${id}`;
    const data = await sequelize.query(query, {type: QueryTypes.UPDATE});
    
    res.redirect("/")
}


async function addProject(req,res) {
    const {tittle, content} = req.body
    const query = `INSERT INTO tb_blogs (tittle,content,image,"createdAt","updatedAt") VALUES('${tittle}','${content}','https://images.pexels.com/photos/2670898/pexels-photo-2670898.jpeg?auto=compress&cs=tinysrgb&w=600', now(), now())`;
    const data = await sequelize.query(query, { type: QueryTypes.INSERT });

    res.redirect("/")
}


function testi(req,res) {
    res.render("testi")  
}


function contact(req,res) {
    res.render("backpageBootstrap")  
}


async function blogDetail(req,res) {
    const {id} = req.params;

    const query =`SELECT * FROM tb_blogs WHERE id=${id}`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });

    console.log("dapat", data[0])

    res.render("project",{data:data[0]}); 
}


app.listen (port,()=>{
    console.log("server is running on port:" , port)
})