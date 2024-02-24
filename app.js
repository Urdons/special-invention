const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "public" folder
app.use(express.static("public"));

// Define routes and middleware here

app.get("/", (req, res) => {
   res.sendFile(__dirname + "/public/index.html");
});



// Define routes and middleware here

app.listen(PORT, () => {
   console.log("Server is running on port 3000");
});
