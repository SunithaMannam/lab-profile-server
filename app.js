
require("dotenv/config");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const express = require('express');
const app = express(); 
require("./configs/db.config");

//Router definition:
const indexRouter = require("./routes/index.route");
const userRouter = require('./routes/user.route');

app.use(cors({
  credentials: true,
  origin: "http://localhost:3000"
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

 
app.use("/", indexRouter);
app.use("/auth", userRouter);

 

module.exports = app;
 