const express = require("express");
const mysql = require("mysql");

const app = express();
app.use(express.static("public"));

// set trust proxy to get client ip
app.set("trust proxy", true);

// set .env
require("dotenv").config();

// create connection
function DbConnection () {
  const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
  });
  return pool;
}

app.set("pool", new DbConnection());

app.listen(3000, () => {
  console.log("The application is running on localhose:3000");
});
