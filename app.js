const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 3000;


// Serve static files from the "public" folder
app.use(express.static("public"));

// Define routes and middleware here

app.get("/", (req, res) => {
   res.sendFile(__dirname + "/public/index.html");
});



app.get("/token/:service", (req, res) => {
   const service = req.params.service;
   console.log(service.toUpperCase() + "_TOKEN", process.env.GITHUB_TOKEN);
   res.send(process.env[service.toUpperCase() + "_TOKEN"] || "No token found");
});



// Define routes and middleware here

app.listen(PORT, () => {
   console.log("Server is running on port 3000");
});
