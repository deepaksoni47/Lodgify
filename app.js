const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/lodgify";

main()
    .then(() =>{
        console.log("connected to DB")
    })
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
  
    // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
  }

app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));

app.get("/",(req,res) => {
    res.send("root is working");
});

app.listen(8080, () =>{
    console.log("server is listening on port 8080");
});