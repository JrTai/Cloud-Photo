require("dotenv").config();
const express = require("express");
const path = require("path");
const { API_VERSION } = process.env;

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// set trust proxy to get client ip
app.set("trust proxy", true);

// API routes
app.use("/api/" + API_VERSION, [
  require("./server/routes/upload_route"),
  require("./server/routes/user_route"),
  require("./server/routes/main_route")
]);

// Page not found
app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname, "/public/404.html"));
});

// Error handling
app.use(function (err, req, res, next) {
  console.log(err);
  res.status(500).send("Internal Server Error");
});

app.listen(3001, () => {
  console.log("The application is running on localhose:3000");
});
