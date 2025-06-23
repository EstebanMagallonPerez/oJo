const https = require("https");
const express = require("express");
const app = express();
const fs = require("fs");

// Get request for root of the app
app.get(/.*/, function (req, res) {
  path = req.url;
  if (path == "/") {
    path = "/index.html";
  }
  res.sendFile(__dirname + "/www/" + path);
});

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

// Creating https server by passing
// options and app object
https.createServer(options, app).listen(3000, function (req, res) {
  console.log("Server started at port 3000!");
});
