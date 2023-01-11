const express = require("express");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");

// const routes = require('./routes');
const TokenManager = require("./routes/token_manager");

const bodyParser = require("body-parser");
const app = express();
const jwt = require("jsonwebtoken");

//connect DB
// mongoose.connect("mongodb://localhost:27017/test", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
// });
//---------------

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const path = require("path");

const http = require("http");
const server = http.createServer(app);

require("dotenv").config();
const { API_HOST, API_PORT, TITLE_PAGE } = process.env;

const host = process.env.HOST || API_HOST;
const port = process.env.PORT || API_PORT;
server.listen(port, host, () =>
  console.log(`Successfully server run on http://${host}:${port}`)
);

const cors = require("cors");
const passport = require("passport");
app.use(cors());

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ---------- MysqlDB Connect ----------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: 'postal'
});

db.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!!");
});

// ---------- MysqlDB Connect ----------

app.post("/login", (req, res) => {
  let userData = req.body;
  let userLoginData = user.find((value) => {
    return value.username == userData && value.password == userData.password;
  });
  if (userLoginData == undefined) {
    res.send(JSON.stringify({ status: "0" }));
  } else {
    let accessToken = TokenManager.getGenerateAccessToken({
      id: userLoginData.id,
    });
    res.sendsend(JSON.stringify({ status: "1", access_token: accessToken }));
  }
});

app.post("/check_authen", (req, res) => {
  let jwtstatus = TokenManager.checkAuthentication(req);
  if (jwtstatus != false) {
    res.send(jwtstatus);
  } else {
    res.send("token error!!");
  }
});

app.post("");

// ----- Begin View Routes
app.get("/register", function (req, res) {
  res.render("/dashboard");
});

// app.post("/routes/login", async (req, res) => {
//   const { username, password: plainTextPassword } = req.body;

//   if (!username || typeof username !== "string") {
//     return res.json({ status: "error", error: "Invalid username" });
//   }

//   if (!plainTextPassword || typeof plainTextPassword !== "string") {
//     return res.json({ status: "error", error: "Invalid password" });
//   }

//   const password = await bcrypt.hash(plainTextPassword, 10);
//   try {
//     const response = await User.create({
//       username,
//       password,
//     });
//     console.log("User created successfully: ", response);
//   } catch (error) {
//     if (error.code === 11000) {
//       // duplicate key
//       return res.json({ status: "error", error: "Username already in use" });
//     }
//     throw error;
//   }
//   res.json({ status: "ok" });
// });

app.get("/", function (req, res, next) {
  res.render("home", {
    documentTitle: TITLE_PAGE,
  });
});

app.get("/login", function (req, res, next) {
  res.render("login", {
    documentTitle: TITLE_PAGE,
  });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  }),
  function (req, res) {}
);

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIN(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

app.get("/dashboard", function (req, res, next) {
  res.render("dashboard", {
    documentTitle: TITLE_PAGE,
  });
});

app.post("/insert", (req, res) => {
  res.redirect("booking");
});

app.get("/booking", function (req, res, next) {
  res.render("booking", {
    documentTitle: TITLE_PAGE,
  });
});

// ----- End View Routes

// ----- Begin Controller Routes
require("./routes/authentication.routes")(app);
require("./routes/user.routes")(app);

// ----- End Controller Routes
